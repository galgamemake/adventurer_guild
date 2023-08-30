//============================================================================
// Quasi Region Events
// Version: 1.0
// Last Update: February 8, 2016
//============================================================================
// ** Terms of Use
// http://quasixi.com/terms-of-use/
// https://github.com/quasixi/RPG-Maker-MV/blob/master/README.md
//============================================================================
// How to install:
//  - Save this file as "QuasiRegionEvents.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - - Place somewhere below QuasiMovement
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://quasixi.com/quasi-region-events/
//  - - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
//============================================================================

var Imported = Imported || {};
Imported.Quasi_RegionEvents = 1.0;

//=============================================================================
 /*:
 * @plugindesc Quasi Movement Addon: Regions and Region Maps can activate events on touch
 * Version 1.00
 * @author Quasi      Site: http://quasixi.com
 *
 * @help
 * =============================================================================
 * ** Links
 * =============================================================================
 * For a guide on how to use this plugin go to:
 *
 *    http://quasixi.com/quasi-region-events/
 *
 * Other Links
 *  - http://quasixi.com/mv/
 *  - https://github.com/quasixi/Quasi-MV-Master-Demo
 *  - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
 */
//=============================================================================

//-----------------------------------------------------------------------------
// Dependencies

if (!Imported.Quasi_Movement) {
  alert("Error: Quasi Region Events requires Quasi Movement to work.");
  throw new Error("Error: Quasi Region Events requires Quasi Movement to work.")
}

//-----------------------------------------------------------------------------
// Quasi Region Events

var QuasiRegionEvents = (function() {
  QuasiRegionEvents = {
    regions: {},
    playerRegions: {},
    cooldown: {}
  };

  QuasiRegionEvents.getRegions = function() {
    for (var i = 1; i < $dataCommonEvents.length; i++) {
      var list = $dataCommonEvents[i].list;
      var id   = $dataCommonEvents[i].id;
      var comment = "";
      for (var j = 0; j < list.length; j++) {
        if (list[j].code !== 108 && list[j].code !== 408) continue;
        comment += list[j].parameters[0];
      }
      var match = /<region:([0-9a-zA-Z,#\s]*)>/.exec(comment);
      if (match) {
        var player = /<playeronly>/i.test(comment);
        var regions = QuasiMovement.stringToAry(match[1]);
        if (typeof regions !== "object") {
          regions = [regions];
        }
        var obj = player ? this.playerRegions : this.regions;
        for (var j = 0; j < regions.length; j++) {
          if (!obj.hasOwnProperty(regions[j])) {
            obj[regions[j]] = [];
          }
          obj[regions[j]].push(id);
        }
      }
      var cd = /<cooldown:([0-9\s]*)>/.exec(comment);
      if (cd) {
        var value = Number(cd[1]) || 0;
        this.cooldown[id] = value;
      }
    }
  };

  //-----------------------------------------------------------------------------
  // DataManager
  //
  // The static class that manages the database and game objects.

  var Alias_DataManager_createGameObjects = DataManager.createGameObjects;
  DataManager.createGameObjects = function() {
    Alias_DataManager_createGameObjects.call(this);
    QuasiRegionEvents.getRegions();
  };

  //-----------------------------------------------------------------------------
  // Game_CharacterBase
  //
  // The superclass of Game_Character. It handles basic information, such as
  // coordinates and images, shared by all characters.

  var Alias_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    Alias_Game_CharacterBase_initMembers.call(this);
    this._regionEventCooldown = {};
  };

  var Alias_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
  Game_CharacterBase.prototype.update = function() {
    Alias_Game_CharacterBase_update.call(this);
    this.updateRegionEventCooldown();
  };

  Game_CharacterBase.prototype.updateRegionEventCooldown = function() {
    for (var id in this._regionEventCooldown) {
      if (!this._regionEventCooldown.hasOwnProperty(id)) continue;
      if (this._regionEventCooldown[id] === 0) {
        delete this._regionEventCooldown[id];
      } else {
        this._regionEventCooldown[id]--;
      }
    }
  };

  var Alias_Game_CharacterBase_onPositionChange = Game_CharacterBase.prototype.onPositionChange;
  Game_CharacterBase.prototype.onPositionChange = function() {
    Alias_Game_CharacterBase_onPositionChange.call(this);
    this.checkRegionEvents();
  };

  Game_CharacterBase.prototype.checkRegionEvents = function() {
    if (this._transparent) return;
    var collider = this.collider();
    var events = [];
    var x1 = Math.floor(collider.edges["top"][0].x);
    var x2 = Math.floor(collider.edges["top"][1].x);
    var y1 = Math.floor(collider.edges["top"][0].y);
    var y2 = Math.floor(collider.edges["bottom"][0].y);
    var p = [[x1, y1], [x2, y1], [x1, y2], [x2, y2]];
    var r1, r2;
    for (var i = 0; i < 4; i++) {
      r1 = $gameMap.regionId(Math.floor(p[i][0] / QuasiMovement.tileSize), Math.floor(p[i][1] / QuasiMovement.tileSize));
      r2 = $gameMap.getPixelRegion(p[i][0], p[i][1]);
      if (QuasiRegionEvents.regions.hasOwnProperty(r1)) {
        events = events.concat(QuasiRegionEvents.regions[r1]);
      }
      if (QuasiRegionEvents.regions.hasOwnProperty(r2)) {
        events = events.concat(QuasiRegionEvents.regions[r2]);
      }
      if (this === $gamePlayer) {
        if (QuasiRegionEvents.playerRegions.hasOwnProperty(r1)) {
          events = events.concat(QuasiRegionEvents.playerRegions[r1]);
        }
        if (QuasiRegionEvents.playerRegions.hasOwnProperty(r2)) {
          events = events.concat(QuasiRegionEvents.playerRegions[r2]);
        }
      }
    }
    var added = [];
    for (var i = 0; i < events.length; i++) {
      var id = events[i];
      if (!id || added.contains(id)) continue;
      added.push(id);
      if (this._regionEventCooldown[id] && this._regionEventCooldown[id] > 0) continue;
      if (QuasiQEvents) {
        var variables = {
          qA: this,
          qAId: this.eventId ? this.eventId() : 0
        }
        QuasiQEvents.start(id, variables);
      } else {
        $gameTemp.reserveCommonEvent(id);
      }
      this._regionEventCooldown[id] = QuasiRegionEvents.cooldown[id] || 0;
    }
  };
  return QuasiRegionEvents;
})();
