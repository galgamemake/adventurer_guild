//=============================================================================
// Quasi Event Turn Based
// Version: 1.00
// Last Update: March 29, 2016
//=============================================================================
// ** Terms of Use
// https://github.com/quasixi/RPG-Maker-MV/blob/master/README.md
//=============================================================================
// Downloading from Github
//  - Click on Raw next to Blame and History
//  - Once new page loads, right click and save as
//=============================================================================
// How to install:
//  - Save this file as "QuasiEventTurnBased.js" in your js/plugins/ folder
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - SiteLink
//  - - RMWLink
//=============================================================================

var Imported = Imported || {};
Imported.QuasiEventTurnBased = 1.00;

//=============================================================================
 /*:
 * @plugindesc Marked events will only move if player moves.
 * Version 1.00
 * <QuasiEventTurnBased>
 * @author Quasi       Site: http://quasixi.com
 *
 * @help
 * ============================================================================
 * ** Quasi Event Turn Based v1.00
 * ============================================================================
 * ** Links
 * ============================================================================
 * For a guide on how to use this plugin go to:
 *
 *   SiteLink
 *
 * Other Links
 *  - https://github.com/quasixi/Quasi-MV-Master-Demo
 *  - RMWLink
 * ============================================================================
 */
//=============================================================================

//-----------------------------------------------------------------------------
// New Classes

//-----------------------------------------------------------------------------
// Quasi Event Turn Based

var QuasiEventTurnBased = {};
(function(QuasiEventTurnBased) {
  var params = $plugins.filter(function(p) { return p.description.contains('<QuasiEventTurnBased>'); })[0].parameters;

  //-----------------------------------------------------------------------------
  // Game_Map
  //
  // The game object class for a map. It contains scrolling and passage
  // determination functions.

  Game_Map.prototype.increaseEventMoveQueue = function() {
    for (var i = 0; i < this._events.length; i++) {
      if (!this._events[i]) continue;
      this._events[i].increaseMoveQueue();
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //
  // The game object class for the player. It contains event starting
  // determinants and map scrolling functions.

  var Alias_Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function(sceneActive) {
    var oldX = this._x;
    var oldY = this._y;
    Alias_Game_Player_update.call(this, sceneActive);
    if (oldX !== this._x || oldY !== this._y) {
      $gameMap.increaseEventMoveQueue();
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Event
  //
  // The game object class for an event. It contains functionality for event page
  // switching and running parallel process events.

  var Alias_Game_Event_initMembers = Game_Event.prototype.initMembers;
  Game_Event.prototype.initMembers = function() {
    Alias_Game_Event_initMembers.call(this);
    this._moveQueue = 0;
    this._turnSteps = 1;
    this._isTurnBased = false;
  };

  Game_Event.prototype.comments = function() {
    if (!this.page() || !this.list()) {
      return "";
    }
    var comments = this.list().filter(function(list) {
      return list.code === 108 || list.code === 408;
    });
    comments = comments.map(function(list) {
      return list.parameters;
    });
    return comments.join('\n');
  };

  var Alias_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
  Game_Event.prototype.setupPageSettings = function() {
    Alias_Game_Event_setupPageSettings.call(this);
    this.setupTurnBased();
  };

  Game_Event.prototype.setupTurnBased = function() {
    var comments = this.comments();
    var match = /<turnbased:(\d+?)>/i.exec(comments);
    if (match) {
      this._isTurnBased = true;
      this._turnSteps = Number(match[1]) || 1;
    } else {
      this._isTurnBased = /<turnbased>/i.test(comments);
    }
  };

  var Alias_Game_Event_updateRoutineMove = Game_Event.prototype.updateRoutineMove;
  Game_Event.prototype.updateRoutineMove = function() {
    if (this.isTurnBased()) {
      if (this._moveQueue > 0) {
        if (this.checkStop(this.stopCountThreshold())) {
          this.decreaseMoveQueue();
        }
        Alias_Game_Event_updateRoutineMove.call(this);
      }
    } else {
      Alias_Game_Event_updateRoutineMove.call(this);
    }
  };

  var Alias_Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
  Game_Event.prototype.updateSelfMovement = function() {
    if (this.isTurnBased()) {
      if (this._moveQueue > 0) {
        if (this.checkStop(this.stopCountThreshold())) {
          this.decreaseMoveQueue();
        }
        Alias_Game_Event_updateSelfMovement.call(this);
      }
    } else {
      Alias_Game_Event_updateSelfMovement.call(this);
    }
  };

  Game_Event.prototype.increaseMoveQueue = function() {
    this._moveQueue += this._turnSteps;
  };

  Game_Event.prototype.decreaseMoveQueue = function() {
    this._moveQueue = Math.max(this._moveQueue - 1, 0);
  };

  Game_Event.prototype.isTurnBased = function() {
    return this._isTurnBased;
  };

}(QuasiEventTurnBased));
