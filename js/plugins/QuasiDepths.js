//============================================================================
// Quasi Depths
// Version: 0.95
// Last Update: February 24, 2016
//============================================================================
// ** Terms of Use
// http://quasixi.com/terms-of-use/
// https://github.com/quasixi/RPG-Maker-MV/blob/master/README.md
//============================================================================
// How to install:
//  - Save this file as "QuasiDepths.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - - Place somewhere below QuasiMovement
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://quasixi.com/mv/
//  - - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
//============================================================================

var Imported = Imported || {};
Imported.Quasi_Depths = 0.95;

//=============================================================================
 /*:
 * @plugindesc Quasi Movement Addon: Adds depth with Region Maps
 * Version 0.95
 * @author Quasi      Site: http://quasixi.com
 *
 * @param Max Depth Step -DISABLED
 * @desc How far up can a character move.
 * Default: 24
 * @default 24
 *
 * @param Min Depth Step -DISABLED
 * @desc How far down can a character move. Set to -1 to allow all depths.
 * Default: -1
 * @default -1
 *
 * @param Wild Depth Color
 * @desc Lets you change depth height. Can be used for inclines.
 * Set to hex color.
 * @default #f7e26b
 *
 * @param Special Depth 1 Color
 * @desc Only lets you walk on this color and the previous Depth.
 * Can be used to create bridges.     Set to hex color.
 * @default #493c2b
 *
 * @param Special Depth 2 Color
 * @desc Changes your priority type to 2 on touch.
 * Can be used to create bridges.     Set to hex color.
 * @default #eb8931
 *
 * @help
 * =============================================================================
 *  !! Important !!
 * =============================================================================
 * This script is incomplete. You can still use it to create bridges and zoom
 * Maps. But it doesn't have all the features I intended to add. I will probably
 * not finish this script because I did not like how it uses region maps.
 * In the future I will probably make a Tiled editor version for this so you
 * can config depths and zooms in that editor.
 * =============================================================================
 * ** Setting up
 * =============================================================================
 * To be able to use this, you first need to create a "Depths.json" file inside
 * the json folder which you pick inside Quasi Movement. How to set up the
 * json file is below.
 * =============================================================================
 * ** Using Depth Collision
 * =============================================================================
 * Using depth collisions lets set different altitudes to tiles. By doing so
 * you can give the 2d map a psuedo 3d feel.
 *   To enable <NoteTag>
 *       <depths>
 *     This note tag should be placed inside the map notes.
 *     * Maps with this tag will ignore collision maps and tile collisions
 *       since it will use depth collisions instead!
 *   Load a depth map <NoteTag>
 *       <rm=FILENAME>
 *     You will load the file as a region map.
 * =============================================================================
 * ** Using Zoom Depth
 * =============================================================================
 * Using zoom depths will change the characters display size depending on the
 * zoom setting of the depth the character is on.
 *   To enable <NoteTag>
 *       <zoomdepth>
 *     This note tag should be placed inside the map notes.
 * =============================================================================
 * ** JSON Setup
 * =============================================================================
 * The json file should be named "Depths.json" and located in the folder you
 * picked to store the json files in Quasi Movement.
 *   The JSON:
 *       {
 *         "HEXCOLOR": {"depth": value, "zoom": value, "shiftY": value}
 *       }
 *     Set HEXCOLOR to the color relating to that depths in the region map.
 *     Set the value for depth to the depths of that region, default 0
 *     Set the value for zoom to the zoom settings for characters on that region, default 1
 *     Set the value for shiftY to the value to offset characters Y while on this region, default 0
 *
 *  Sample JSON
 *      https://gist.github.com/quasixi/c888b981ba41e42d34f6
 * =============================================================================
 * Links
 *  - http://quasixi.com/mv/
 *  - https://github.com/quasixi/RPG-Maker-MV
 *  - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
 */
//=============================================================================

if (!Imported.Quasi_Movement) {
  alert("Error: Quasi Depths requires Quasi Movement to work.");
  throw new Error("Error: Quasi Depths requires Quasi Movement to work.")
}
(function() {
  var Depths = {};
  Depths.params   = PluginManager.parameters('QuasiDepths');
  Depths.wild     = Depths.params['Wild Depth Color'];
  Depths.special1 = Depths.params['Special Depth 1 Color'];
  Depths.special2 = Depths.params['Special Depth 2 Color'];
  /*
  Depths.minStep  = Number(Depths.params['Min Depth Step'] || 0);
  Depths.maxStep  = Number(Depths.params['Max Depth Step'] || 0);
  Depths.jumps    = [];
  */
  Depths.data = {};

  Depths.load = function() {
    var xhr = new XMLHttpRequest();
    var url = QuasiMovement.jFolder + 'Depths.json';
    xhr.open('GET', url, true);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
      Depths.data = JSON.parse(xhr.responseText);
    };
    xhr.onerror = function() {
      alert("File: " + QuasiMovement.jFolder + "Depths.json not found.");
    };
    xhr.send();
  };
  Depths.load();

  var Alias_QuasiMovement_Polygon_Collider_initialize = QuasiMovement.Polygon_Collider.prototype.initialize;
  QuasiMovement.Polygon_Collider.prototype.initialize = function(points) {
    Alias_QuasiMovement_Polygon_Collider_initialize.call(this, points)
    this.depth = 0;
    this.depthHeight = 0;
    //this.depthHeight = h;
  };

  var Alias_QuasiMovement_Box_Collider_initialize = QuasiMovement.Box_Collider.prototype.initialize;
  QuasiMovement.Box_Collider.prototype.initialize = function(w, h, ox, oy, shift_y) {
    Alias_QuasiMovement_Box_Collider_initialize.call(this, w, h, ox, oy, shift_y);
    this.depth = 0;
    this.depthHeight = 0;
    //this.depthHeight = h;
  };

  var Alias_QuasiMovement_Circle_Collider_initialize = QuasiMovement.Circle_Collider.prototype.initialize;
  QuasiMovement.Circle_Collider.prototype.initialize = function(w, h, ox, oy, shift_y) {
    Alias_QuasiMovement_Circle_Collider_initialize.call(this, w, h, ox, oy, shift_y);
    this.depth = 0;
    this.depthHeight = 0;
    //this.depthHeight = h;
  };

  var Alias_QuasiMovement_Polygon_Collider_intersects = QuasiMovement.Polygon_Collider.prototype.intersects;
  QuasiMovement.Polygon_Collider.prototype.intersects = function(other) {
    if (other.depth !== this.depth) {
      if (!this.depthContains(other.depth, other.depthHeight)) {
        return false;
      }
    }
    return Alias_QuasiMovement_Polygon_Collider_intersects.call(this, other);
  };

  var Alias_QuasiMovement_Polygon_Collider_insideWithDepth = QuasiMovement.Polygon_Collider.prototype.insideWithDepth;
  QuasiMovement.Polygon_Collider.prototype.insideWithDepth = function(other) {
    if (other.depth !== this.depth) {
      if (!this.depthContains(other.depth, other.depthHeight)) {
        return false;
      }
    }
    return Alias_QuasiMovement_Polygon_Collider_insideWithDepth.call(this, other);
  };

  QuasiMovement.Polygon_Collider.prototype.depthContains = function(z1, z2) {
    if (!$gameMap.hasDepth()) {
      return true;
    }
    var zi1 = this.depth;
    var zi2 = z1;
    var zf1 = zi1 + this.depthHeight;
    var zf2 = z2 || z1;
    return (zi1 <= zf2) && (zf1 >= zi2);
  };

  //-----------------------------------------------------------------------------
  // Game_Map
  //
  // The game object class for a map. It contains scrolling and passage
  // determination functions.

  var Alias_Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    Alias_Game_Map_setup.call(this, mapId);
    this._hasDepth = null;
    this._hasZoomDepth = null;
  }

  Game_Map.prototype.hasDepth = function() {
    if (this._hasDepth === null) {
      this._hasDepth = /<depths>/i.test($dataMap.note);
    }
    return this._hasDepth;
  };

  Game_Map.prototype.hasZoomDepth = function() {
    if (this._hasZoomDepth === null) {
      this._hasZoomDepth = /<zoomdepth>/i.test($dataMap.note);
    }
    return this._hasZoomDepth;
  };

  var Alias_Game_Map_collisionMapPass = Game_Map.prototype.collisionMapPass;
  Game_Map.prototype.collisionMapPass = function(collider, dir, level) {
    if (this.hasDepth()) return true;
    return Alias_Game_Map_collisionMapPass.call(this, collider, dir, level);
  };

  var Alias_Game_Map_drawTileBoxes = Game_Map.prototype.drawTileBoxes;
  Game_Map.prototype.drawTileBoxes = function() {
    if (this.hasDepth()) return;
    return Alias_Game_Map_drawTileBoxes.call(this);
  };

  //-----------------------------------------------------------------------------
  // Game_CharacterBase
  //
  // The superclass of Game_Character. It handles basic information, such as
  // coordinates and images, shared by all characters.

  var Alias_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    Alias_Game_CharacterBase_initMembers.call(this);
    this._depth = this._prevDepth = 0;
    this._zoomDepth = 1;
    this._shiftY = 0;
  }

  var Alias_Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
  Game_CharacterBase.prototype.shiftY = function() {
    return Alias_Game_CharacterBase_shiftY.call(this) + this._shiftY;
  };

  var Alias_Game_CharacterBase_onPositionChange = Game_CharacterBase.prototype.onPositionChange;
  Game_CharacterBase.prototype.onPositionChange = function() {
    if ($gameMap.hasDepth()) {
      if (this._depth !== this.depth()) {
        this.onDepthChange();
      }
    }
    if ($gameMap.hasZoomDepth()) {
      if (this._zoomDepth !== this.zoomDepth()) {
        this.onZoomDepthChange();
      }
    }
    Alias_Game_CharacterBase_onPositionChange.call(this);
  };

  Game_CharacterBase.prototype.onDepthChange = function() {
    if (!this._onSpecialDepth1 && !this._onSpecialDepth2) {
      this._prevPriority = this._priorityType;
    }
    this._prevDepth = this._depth;
    this._depth = this.depth();
    for (var i = 0; i < this._collider.length; i++) {
      if (this._collider[i]) {
        this._collider[i].depth = this._depth;
      }
    }
  };


  Game_CharacterBase.prototype.onZoomDepthChange = function() {
    this._zoomDepth = this.zoomDepth();
    for (var i = 0; i < this._collider.length; i++) {
      if (this._collider[i]) {
        this._collider[i].scaleTo(this._zoomDepth, this._zoomDepth);
      }
    }
  };

  Game_CharacterBase.prototype.depth = function() {
    if ($gameMap.hasDepth()) {
      var color = $gameMap.getPixelRegion(this.cx(), this.cy())
      this._onSpecialDepth1 = color === Depths.special1;
      this._onSpecialDepth2 = color === Depths.special2;
      this._onWildDepth     = color === Depths.wild;
      if (this._onSpecialDepth1 || this._onSpecialDepth2) {
        if (!this._onSpecialDepth) {
          this._onSpecialDepth = [Depths.special1];
          if (this._onSpecialDepth2) {
            this._onSpecialDepth.push(Depths.special2);
          }
        }
        if (this._onSpecialDepth2) {
          this.setPriorityType(2);
        }
        return this._prevDepth;
      } else if (!this._onSpecialDepth1 && !this._onSpecialDepth2){
        this.setPriorityType(this._prevPriority || 1);
        this._onSpecialDepth = null;
      }
      if (Depths.data[color]) {
        this._shiftY = Depths.data[color].shiftY || 0;
        return Depths.data[color].depth || 0;
      }
    }
    return 0;
  };

  Game_CharacterBase.prototype.zoomDepth = function() {
    if ($gameMap.hasZoomDepth()) {
      var color = $gameMap.getPixelRegion(this.cx(), this.cy())
      if (Depths.data[color]) {
        return Depths.data[color].zoom || 1;
      }
    }
    return 1;
  };

  var Alias_Game_CharacterBase_collideWithTileBox = Game_CharacterBase.prototype.collideWithTileBox;
  Game_CharacterBase.prototype.collideWithTileBox = function(d) {
    if ($gameMap.hasDepth()) {
     return !this.canPassDepth(d);
    }
    return Alias_Game_CharacterBase_collideWithTileBox.call(this, d);
  }

  Game_CharacterBase.prototype.canPassDepth = function(d) {
    var vertices = this.collider(d).vertices();
    var pass = 0;
    for (var i = 0; i < vertices.length; i++) {
      var color = $gameMap.getPixelRegion(vertices[i].x, vertices[i].y);
      /*
      if (Depths.jumps.contains(color)) {
        if (!this.isJumping()) {
          this.jump(1, 0)
        }
        break;
      }
      */
     if (color === QuasiMovement.collision) {
       return false;
     }
      if (this._onSpecialDepth) {
        if (this._onSpecialDepth.contains(color)) {
          pass++;
          continue;
        }
      } else {
        if (color === Depths.special1 || color === Depths.special2) {
          pass++;
          continue;
        }
      }
      if (color === Depths.wild || this._onWildDepth) {
        pass += 4;
        continue;
      }
      if (Depths.data[color]) {
        /*
        var dif = (Depths.data[color].depth - this.collider(d).depth);
        if (dif < 0) {
          if (Depths.minStep === -1) {
            if (!this.isJumping()) {
              this.jumpForward(d);
            }
            break;
          }
          if (Math.abs(dif) <= Depths.minStep) {
            if (!this.isJumping()) {
              this.jumpForward(d);
            }
            break;
          }
        } else if (dif > 0) {
          if (Math.abs(dif) <= Depths.maxStep) {
            if (!this.isJumping()) {
              this.jumpForward(d);
            }
            break;
          }
        }
        */
        if (this.collider(d).depthContains(Depths.data[color].depth)) {
          pass++;
          continue;
        }
      }
    }
    return pass >= 4;
  };

  var Alias_Game_CharacterBase_frameSpeed = Game_CharacterBase.prototype.frameSpeed;
  Game_CharacterBase.prototype.frameSpeed = function() {
    var spd = Alias_Game_CharacterBase_frameSpeed.call(this);
    return spd * this._zoomDepth;
  };

  var Alias_Game_CharacterBase_reloadBoxes = Game_CharacterBase.prototype.reloadBoxes;
  Game_CharacterBase.prototype.reloadBoxes = function() {
    Alias_Game_CharacterBase_reloadBoxes.call(this);
    this.onZoomDepthChange();
  };

  //-----------------------------------------------------------------------------
  // Game_Character
  //
  // The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

  var Alias_Game_Character_subMove = Game_Character.prototype.subMove;
  Game_Character.prototype.subMmove = function(settings) {
    settings = QuasiMovement.stringToAry(settings);
    settings[1] *= this._zoomDepth;
    Alias_Game_Character_subMmove.call(this, settings.toString());
  }

  var Alias_Game_Character_subQmove = Game_Character.prototype.subQmove;
  Game_Character.prototype.subQmove = function(settings) {
    settings = QuasiMovement.stringToAry(settings);
    settings[1] *= this._zoomDepth;
    Alias_Game_Character_subQmove.call(this, settings.toString());
  };

  //-----------------------------------------------------------------------------
  // Sprite_Character
  //
  // The sprite for displaying a character.

  var Alias_Sprite_Character_update = Sprite_Character.prototype.update;
  Sprite_Character.prototype.update = function() {
    Alias_Sprite_Character_update.call(this);
    if (this._zoomDepth !== this._character.zoomDepth()) {
      this.scale.x = this._character.zoomDepth();
      this.scale.y = this._character.zoomDepth();
      this._zoomDepth = this._character.zoomDepth();
    };
  };
})();
