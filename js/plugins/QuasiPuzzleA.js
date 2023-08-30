//=============================================================================
// Quasi Puzzle A
// Version: 1.02
// Last Update: July 10, 2016
//=============================================================================
// ** Terms of Use
// http://quasixi.com/terms-of-use/
// https://github.com/quasixi/RPG-Maker-MV/blob/master/README.md
//=============================================================================
// Downloading from Github
//  - Click on Raw next to Blame and History
//  - Once new page loads, right click and save as
//=============================================================================
// How to install:
//  - Save this file as "QuasiPuzzleA.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://forums.rpgmakerweb.com/index.php?/topic/58256-quasi-puzzle/
//=============================================================================

var Imported = Imported || {};
Imported.QuasiPuzzleA = 1.01;

//=============================================================================
 /*:
 * @plugindesc v 1.02
 * Makes creating puzzle mechanics easier.
 * <QuasiPuzzleA>
 *
 * @author Quasi
 *
 * @help
 * ============================================================================
 * ** Links
 * ============================================================================
 * For a guide on how to use this plugin go to:
 *
 *   http://forums.rpgmakerweb.com/index.php?/topic/58256-quasi-puzzle/
 * ============================================================================
 */
//=============================================================================

//-----------------------------------------------------------------------------
// Quasi Puzzle A

var QuasiPuzzleA = {};
(function() {
  //-----------------------------------------------------------------------------
  // Game_CharacterBase
  //
  // The superclass of Game_Character. It handles basic information, such as
  // coordinates and images, shared by all characters.

  var Alias_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    Alias_Game_CharacterBase_initMembers.call(this);
    this.unbind();
  };

  Game_CharacterBase.prototype.isBinded = function() {
    return this._bindedBy  ? true : false;
  };

  Game_CharacterBase.prototype.isBinding = function() {
    return this._bindedTo  ? true : false;
  };

  Game_CharacterBase.prototype.bindToCharacter = function(chara) {
    this._bindedBy = chara;
    chara._bindedTo = this;
  };

  Game_CharacterBase.prototype.bindSpeedToCharacter = function(chara) {
    this._bindSpeed = chara;
  };

  Game_CharacterBase.prototype.unbind = function() {
    this._bindedBy = null;
    this._bindedTo = null;
    this._bindSpeed = null;
  };

  var Alias_Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
  Game_CharacterBase.prototype.realMoveSpeed = function() {
    if (this._bindSpeed) {
      return this._bindSpeed.realMoveSpeed();
    }
    return Alias_Game_CharacterBase_realMoveSpeed.call(this);
  };

  var Alias_Game_CharacterBase_isCollidedWithEvents = Game_CharacterBase.prototype.isCollidedWithEvents;
  Game_CharacterBase.prototype.isCollidedWithEvents = function(x, y) {
    if (this.isBinding() || this.isBinded()) {
      if (Imported.Quasi_Movement) {
        var events = $gameMap.getCharactersAt(this.collider());
      } else {
        var events = $gameMap.eventsXyNt(x, y);
      }
      return events.some(function(event) {
        if (event === this._bindedTo || event === this._bindedBy) {
          return false;
        }
        return event.isNormalPriority();
      }, this);
    }
    return Alias_Game_CharacterBase_isCollidedWithEvents.call(this, x, y);
  };

  if (Imported.Quasi_Movement) {
    var Alias_Game_CharacterBase_ignoreCollisionWithCharacter = Game_CharacterBase.prototype.ignoreCollisionWithCharacter;
    Game_CharacterBase.prototype.ignoreCollisionWithCharacter = function(chara, self) {
      if (chara === self._bindedTo || chara === self._bindedBy) {
        return true;
      }
      return Alias_Game_CharacterBase_ignoreCollisionWithCharacter.call(self, chara, self);
    };
  }

  var Alias_Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
  Game_CharacterBase.prototype.moveStraight = function(d) {
    if (this.isBinding()) {
      var thisPassed = this.canPass(this._x, this._y, d);
      var bindedToPassed = this._bindedTo.canPass(this._bindedTo._x, this._bindedTo._y, d);
      if (thisPassed && bindedToPassed) {
        this._bindedTo.moveStraight(d);
        Alias_Game_CharacterBase_moveStraight.call(this, d);
      }
      return false;
    }
    return Alias_Game_CharacterBase_moveStraight.call(this, d);
  };

  var Alias_Game_CharacterBase_moveDiagonally = Game_CharacterBase.prototype.moveDiagonally;
  Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
    if (this.isBinding()) {
      var thisPassed = this.canPassDiagonally(this._x, this._y, horz, vert);
      var bindedToPassed = this._bindedTo.canPassDiagonally(this._bindedTo._x, this._bindedTo._y, horz, vert);
      if (thisPassed && bindedToPassed) {
        this._bindedTo.moveDiagonally(horz, vert);
        Alias_Game_CharacterBase_moveDiagonally.call(this, horz, vert);
      }
      return false;
    }
    return Alias_Game_CharacterBase_moveDiagonally.call(this, horz, vert);
  };

  Game_CharacterBase.prototype.weight = function() {
    return this._weight || 0;
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //
  // The game object class for the player. It contains event starting
  // determinants and map scrolling functions.

  var Alias_Game_Player_triggerButtonAction = Game_Player.prototype.triggerButtonAction;
  Game_Player.prototype.triggerButtonAction = function() {
    if (Input.isTriggered('ok')) {
      this.checkForPushObjects();
    }
    Alias_Game_Player_triggerButtonAction.call(this);
  };

  Game_Player.prototype.checkForPushObjects = function() {
    if (this.isBinding()) {
      this._bindedTo.unbind();
      this.unbind();
      this.setDirectionFix(this._oldDirLock);
      Input.clear();
      return;
    }
    var direction = this.direction();
    var x1 = this.x;
    var y1 = this.y;
    var x2 = $gameMap.roundXWithDirection(x1, direction);
    var y2 = $gameMap.roundYWithDirection(y1, direction);
    if (Imported.Quasi_Movement) {
      x1 = this._px;
      y1 = this._py;
      x2 = $gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
      y2 = $gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
      this.collider().moveto(x2, y2);
      var events = $gameMap.getCharactersAt(this.collider(), function(chara) {
        return chara.constructor !== Game_Event;
      });
      this.collider().moveto(x1, y1);
    } else {
      var events = $gameMap.eventsXy(x2, y2);
    }
    var event = events.filter(function(event) {
      var note = event.event().note;
      return /<pushoninput>/i.test(note);
    })
    var event = event[0];
    if (event) {
      event.bindToCharacter(this);
      this.bindSpeedToCharacter(event);
      this._oldDirLock = this.isDirectionFixed();
      this.setDirectionFix(true);
      Input.clear();
    }
  };

  Game_Player.prototype.weight = function() {
    var actor = $gameParty.leader();
    if (actor) {
      var weight = actor.actor().meta.weight;
      return Number(weight) || 0;
    }
    return 0;
  };

  //-----------------------------------------------------------------------------
  // Game_Event
  //
  // The game object class for an event. It contains functionality for event page
  // switching and running parallel process events.

  var Alias_Game_Event_initialize = Game_Event.prototype.initialize;
  Game_Event.prototype.initialize = function(mapId, eventId) {
    Alias_Game_Event_initialize.call(this, mapId, eventId);
    var note = this.event().note;
    this._isPushOnInput = /<pushoninput>/i.test(note);
    var weight = /<weight[:|=](\d+?)>/i.exec(note);
    this._weight = 0;
    if (weight) {
      this._weight = Number(weight[1]) || 0;
    }
    this._weightSwitch = {
      amt: 0,
      list1: [],
      list2: []
    }
    var weightSwitch = /<weightswitch[:|=](\d+?)>/i.exec(note);
    if (weightSwitch) {
      this._weightSwitch.amt = Number(weightSwitch[1]) || 0;
      this.setupWeightSwitch();
    }
    this._switchToggled = false;
  };

  Game_Event.prototype.setupWeightSwitch = function() {
    this._trigger = "weightSwitch";
    var list = this.list();
    var addTo;
    var prevAdd;
    for (var i = 0; i < list.length; i++) {
      if (list[i].code === 118 && list[i].parameters[0] === "#pressed") {
        addTo = "list1";
      }
      if (list[i].code === 118 && list[i].parameters[0] === "#unpressed") {
        addTo = "list2";
      }
      if (addTo) {
        this._weightSwitch[addTo].push(list[i]);
      }
      if (prevAdd && prevAdd !== addTo) {
        this._weightSwitch[prevAdd].push({
          code: 0,
          indent: 0,
          parameters: []
        });
        prevAdd = addTo;
      };
    }
  };

  Game_Event.prototype.hasEnoughWeight = function() {
    var totalWeight = 0;
    if (Imported.Quasi_Movement) {
      var charas = $gameMap.getCharactersAt(this.collider());
    } else {
      var charas = $gameMap.eventsXy(this.x, this.y);
    }
    for (var i = 0; i < charas.length; i++) {
      if (charas[i] === $gamePlayer) {
        totalWeight += $gamePlayer.weight();
      } else {
        totalWeight += charas[i]._weight || 0;
      }
    }
    if (!Imported.Quasi_Movement) {
      if ($gamePlayer.isCollided(this.x, this.y)) {
        totalWeight += $gamePlayer.weight();
      }
    }
    return totalWeight >= this._weightSwitch.amt;
  };

  var Alias_Game_Event_isCollidedWithPlayerCharacters = Game_Event.prototype.isCollidedWithPlayerCharacters;
  Game_Event.prototype.isCollidedWithPlayerCharacters = function(x, y) {
    if (this.isBinded() && this._bindedBy === $gamePlayer) {
      return false;
    }
    return Alias_Game_Event_isCollidedWithPlayerCharacters.call(this, x, y);
  };

  var Alias_Game_Event_list = Game_Event.prototype.list;
  Game_Event.prototype.list = function() {
    if (this._switchList) {
      return this._switchList;
    }
    return Alias_Game_Event_list.call(this);
  };

  var Alias_Game_Event_update = Game_Event.prototype.update;
  Game_Event.prototype.update = function() {
    if (this._weightSwitch.amt > 0) {
      var bool = this.hasEnoughWeight();
      if (this._switchToggled !== bool) {
        this._switchToggled = bool;
        if (bool) {
          this._switchList = this._weightSwitch.list1;
        } else {
          this._switchList = this._weightSwitch.list2;
        }
        this.start();
      }
    }
    Alias_Game_Event_update.call(this);
  };

}());
