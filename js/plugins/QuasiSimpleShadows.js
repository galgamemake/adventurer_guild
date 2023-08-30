//=============================================================================
// Quasi Simple Shadows
// Version: 1.053
// Last Update: August 10, 2016
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
//  - Save this file as "QuasiSimpleShadows.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://forums.rpgmakerweb.com/index.php?/topic/58685-quasi-simple-shadows/
//=============================================================================

var Imported = Imported || {};
Imported.QuasiSimpleShadows = 1.053;

//=============================================================================
 /*:
 * @plugindesc Version 1.053 Adds Simple Shadows to characters
 * <QuasiSimpleShadows>
 * @author Quasi
 *
 * @param Default Source Radius
 * @desc Set the default radius for the source in Pixels
 * Default: 240
 * @default 240
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Enable Shadow Blur
 * @desc Set to true or false to enable blur on shadows
 * Default: true
 * @default true
 *
 * @param Shadow Blur Strength
 * @desc Set to a number that represents the blur strength
 * Default: 7 ( larger number, stronger blur )
 * @default 7
 *
 * @param Enable Shadow Zoom
 * @desc Set to true or false to enable zooming on shadows
 * Default: true
 * @default true
 *
 * @help
 * ============================================================================
 * ** Links
 * ============================================================================
 * For a guide on how to use this plugin go to:
 *  - http://forums.rpgmakerweb.com/index.php?/topic/58685-quasi-simple-shadows/
 * ============================================================================
 */
//=============================================================================

//-----------------------------------------------------------------------------
// New Classes

function Sprite_CharacterShadow() {
  this.initialize.apply(this, arguments);
}

//-----------------------------------------------------------------------------
// Quasi Simple Shadows

var QuasiSimpleShadows = {};
(function(QuasiSimpleShadows) {
  var params = $plugins.filter(function(p) { return p.description.contains('<QuasiSimpleShadows>'); })[0].parameters;
  QuasiSimpleShadows.defaultRadius = Number(params["Default Source Radius"]) || 1;
  QuasiSimpleShadows.enableBlur    = params["Enable Shadow Blur"] === "true";
  QuasiSimpleShadows.blurStr       = Number(params["Shadow Blur Strength"]) || 0;
  QuasiSimpleShadows.enableZoom    = params["Enable Shadow Zoom"] === "true";
  QuasiSimpleShadows._sources = [];
  QuasiSimpleShadows._mapId = null;

  QuasiSimpleShadows._shadowLayer = new Sprite();
  QuasiSimpleShadows._shadowLayer.z = 1;

  // Creates a radial gradient texture and returns
  // a sprite using that texture
  QuasiSimpleShadows.radialGradient = function(radius, color1, color2) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var w = Graphics.width * 2;
    var h = Graphics.height * 2;
    canvas.width = w;
    canvas.height = h;
    var cx = w / 2;
    var cy = h / 2;
    var grd = ctx.createRadialGradient(cx, cy, radius, cx, cy, 0);
    grd.addColorStop(0, color1);
    grd.addColorStop(1, color2);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    var texture = new PIXI.Texture.fromCanvas(canvas);
    var sprite = new PIXI.Sprite(texture);
    sprite.anchor = new Point(0.5, 0.5);
    return sprite;
  };

  var Alias_Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    Alias_Game_Map_setup.call(this, mapId);
    if (mapId !== QuasiSimpleShadows._mapId) {
      $gamePlayer.simpleShadowMembers();
      QuasiSimpleShadows._sources = [];
      QuasiSimpleShadows._shadowLayer = new Sprite();
      QuasiSimpleShadows._shadowLayer.z = 1;
      for (var i = 0; i < this.events().length; i++) {
        this.events()[i].getSimpleShadow();
      }
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Interpreter
  //
  // The interpreter for running event commands.

  var Alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (command.toLowerCase() === "quasi") {
      if (args[0].toLowerCase() === "addshadowsource") {
        var id = Number(args[1]);
        var chara = id === 0 ? $gamePlayer : $gameMap.event(id);
        var radius = Number(args[2]);
        var str = Number(args[3]);
        var delay = Number(args[4]);
        chara.setupSimpleShadow(radius, str, delay);
        return;
      }
      if (args[0].toLowerCase() === "removeshadowsource") {
        var id = Number(args[1]);
        var chara = id === 0 ? $gamePlayer : $gameMap.event(id);
        chara.clearSimpleShadow();
        return;
      }
      if (args[0].toLowerCase() === "hideshadow") {
        var id = Number(args[1]);
        var chara = id === 0 ? $gamePlayer : $gameMap.event(id);
        chara.setHasShadow(false);
        return;
      }
      if (args[0].toLowerCase() === "showshadow") {
        var id = Number(args[1]);
        var chara = id === 0 ? $gamePlayer : $gameMap.event(id);
        chara.setHasShadow(true);
        return;
      }
      if (args[0].toLowerCase() === "setshadowoffset") {
        var id = Number(args[1]);
        var chara = id === 0 ? $gamePlayer : $gameMap.event(id);
        chara._shadowOffset.x = Number(args[2]) || 0;
        chara._shadowOffset.y = Number(args[3]) || 0;
        return;
      }
      if (args[0].toLowerCase() === "setshadowanchor") {
        var id = Number(args[1]);
        var chara = id === 0 ? $gamePlayer : $gameMap.event(id);
        chara._shadowAnchor.x = isNaN(Number(args[2])) ? 0.5 : Number(args[2]);
        chara._shadowAnchor.y = isNaN(Number(args[3])) ? 1 : Number(args[3]);
        return;
      }
    }
    Alias_Game_Interpreter_pluginCommand.call(this, command, args);
  };

  //-----------------------------------------------------------------------------
  // Game_CharacterBase
  //
  // The superclass of Game_Character. It handles basic information, such as
  // coordinates and images, shared by all characters.

  var Alias_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    Alias_Game_CharacterBase_initMembers.call(this);
    this.simpleShadowMembers();
  };

  Game_CharacterBase.prototype.simpleShadowMembers = function() {
    this._simpleShadowRadius = 0;
    this._shadowAddQueue = [];
    this._shadowRemoveQueue = [];
    this._addedShadows = null;
    this._hasShadow = true;
    this._shadowOffset = {x: 0, y: 0};
    this._shadowAnchor = {x: 0.5, y: 1};
  }

  Game_CharacterBase.prototype.addShadow = function(source) {
    this._shadowAddQueue.push(source);
  };

  Game_CharacterBase.prototype.removeShadow = function(source) {
    this._shadowRemoveQueue.push(source);
  };

  Game_CharacterBase.prototype.requestingAddShadow = function() {
    return this._shadowAddQueue.length > 0;
  };

  Game_CharacterBase.prototype.requestingRemoveShadow = function() {
    return this._shadowRemoveQueue.length > 0;
  };

  Game_CharacterBase.prototype.castsShadows = function() {
    return this._simpleShadowRadius > 0;
  };

  Game_CharacterBase.prototype.hasShadow = function() {
    return this._hasShadow;
  };

  var Alias_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
  Game_CharacterBase.prototype.update = function() {
    Alias_Game_CharacterBase_update.call(this);
    if (this._addedShadows !== QuasiSimpleShadows._sources.length) {
      this.addSimpleShadows();
      this._addedShadows = QuasiSimpleShadows._sources.length
    }
  };

  Game_CharacterBase.prototype.addSimpleShadows = function() {
    for (var i = 0; i < QuasiSimpleShadows._sources.length; i++) {
      if (this !== QuasiSimpleShadows._sources[i]) {
        this.addShadow(QuasiSimpleShadows._sources[i]);
      };
    }
  };

  Game_CharacterBase.prototype.setupSimpleShadow = function(radius, str, delay) {
    this._simpleShadowRadius = radius || QuasiSimpleShadows.defaultRadius;
    this._simpleShadowFlickerStr   = str || 0;
    this._simpleShadowFlickerDelay = delay || 0;
    QuasiSimpleShadows._sources.push(this);
  };

  Game_CharacterBase.prototype.clearSimpleShadow = function() {
    this._simpleShadowRadius = 0;
    this._simpleShadowFlickerStr   = 0;
    this._simpleShadowFlickerDelay = 0;
    var i = QuasiSimpleShadows._sources.indexOf(this);
    if (i > 0) {
      QuasiSimpleShadows._sources.splice(i, 1);
    }
  };

  Game_CharacterBase.prototype.setHasShadow = function(bool) {
    this._hasShadow = bool;
  };

  Game_CharacterBase.prototype.shadowOffsetX = function() {
    return this._shadowOffset.x;
  };

  Game_CharacterBase.prototype.shadowOffsetY = function() {
    return this._shadowOffset.y;
  };

  Game_CharacterBase.prototype.shadowAnchorX = function() {
    return this._shadowAnchor.x;
  };

  Game_CharacterBase.prototype.shadowAnchorY = function() {
    return this._shadowAnchor.y;
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //
  // The game object class for the player. It contains event starting
  // determinants and map scrolling functions.

  var Alias_Game_Player_refresh = Game_Player.prototype.refresh;
  Game_Player.prototype.refresh = function() {
    Alias_Game_Player_refresh.call(this);
    if ($gameParty.leader()) {
      this.setupShadowOffset();
      this.setupShadowAnchor();
    }
  };

  Game_Player.prototype.setupShadowOffset = function() {
    var comments = $gameParty.leader().actor().note;
    var offsetX = /<shadowOX:(-?\d+?)>/i.exec(comments);
    if (offsetX) {
      this._shadowOffset.x = Number(offsetX[1]);
    }
    var offsetY = /<shadowOY:(-?\d+?)>/i.exec(comments);
    if (offsetY) {
      this._shadowOffset.y = Number(offsetY[1]);
    }
  };

  Game_Player.prototype.setupShadowAnchor = function() {
    var comments = $gameParty.leader().actor().note;
    var anchorX = /<shadowAnchorX:(.*?)>/i.exec(comments);
    if (anchorX) {
      this._shadowAnchor.x = Number(anchorX[1]);
    }
    var anchorY = /<shadowAnchorY:(.*?)>/i.exec(comments);
    if (anchorY) {
      this._shadowAnchor.y = Number(anchorY[1]);
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Event
  //
  // The game object class for an event. It contains functionality for event page
  // switching and running parallel process events.

  var Alias_Game_Event_initialize = Game_Event.prototype.initialize;
  Game_Event.prototype.initialize = function(mapId, eventId) {
    Alias_Game_Event_initialize.call(this, mapId, eventId);
    this.setDefaultHasShadow();
  };

  Game_Event.prototype.setDefaultHasShadow = function() {
    var notes = this.event().note || "";
    this._hasShadow = !(/<noshadow>/i.test(notes));
  };

  var Alias_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
  Game_Event.prototype.setupPageSettings = function() {
    Alias_Game_Event_setupPageSettings.call(this);
    this.setupShadowOffset();
    this.setupShadowAnchor();
  };

  Game_Event.prototype.setupShadowOffset = function() {
    var comments = this.comments();
    var offsetX = /<shadowOX:(-?\d+?)>/i.exec(comments);
    if (offsetX) {
      this._shadowOffset.x = Number(offsetX[1]);
    }
    var offsetY = /<shadowOY:(-?\d+?)>/i.exec(comments);
    if (offsetY) {
      this._shadowOffset.y = Number(offsetY[1]);
    }
  };

  Game_Event.prototype.setupShadowAnchor = function() {
    var comments = this.comments();
    var anchorX = /<shadowAnchorX:(.*?)>/i.exec(comments);
    if (anchorX) {
      this._shadowAnchor.x = Number(anchorX[1]);
    }
    var anchorY = /<shadowAnchorY:(.*?)>/i.exec(comments);
    if (anchorY) {
      this._shadowAnchor.y = Number(anchorY[1]);
    }
  };

  Game_Event.prototype.getSimpleShadow = function() {
    var notes = this.event().note || "";
    if (/<lightsource>/i.test(notes) || /<shadowsource>/i.test(notes)) {
      this.setupSimpleShadow(QuasiSimpleShadows.defaultRadius);
    } else {
      var source = /<lightsource:([0-9,]*?)>/i.exec(notes);
      if (!source) {
        source = /<shadowsource:([0-9,]*?)>/i.exec(notes);
      }
      if (source) {
        var settings = source[1].split(",").map(function(i) { return Number(i) });
        var radius = settings[0] || 1;
        var flickerStr = settings[1];
        var flickerDelay = settings[2];
        this.setupSimpleShadow(radius, flickerStr, flickerDelay);
      }
    }
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

  //-----------------------------------------------------------------------------
  // Sprite_Character
  //
  // The sprite for displaying a character.

  var Alias_Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
  Sprite_Character.prototype.initMembers = function() {
    Alias_Sprite_Character_initMembers.call(this);
    this._shadows = {};
  };

  var Alias_Sprite_Character_update = Sprite_Character.prototype.update;
  Sprite_Character.prototype.update = function() {
    Alias_Sprite_Character_update.call(this);
    if (this._character) this.updateShadows();
  };

  Sprite_Character.prototype.updateShadows = function() {
    if (this._character.requestingAddShadow()) {
      var addQueue = this._character._shadowAddQueue;
      for (var i = addQueue.length - 1; i >= 0 ; i--) {
        this.addShadow(addQueue[i]);
        addQueue.splice(i, 1);
      }
    }
    if (this._character.requestingRemoveShadow()) {
      var removeQueue = this._character._shadowRemoveQueue;
      for (var i = removeQueue.length - 1; i >= 0 ; i--) {
        this.removeShadow(removeQueue[i]);
        removeQueue.splice(i, 1);
      }
    }
  };

  Sprite_Character.prototype.addShadow = function(source) {
    if (source.eventId) {
      var id = source.eventId();
    } else {
      var id = 0;
    }
    if (this._shadows[id]) return;
    var shadow = new Sprite_CharacterShadow(this._character, source);
    this._shadows[id] = shadow;
    QuasiSimpleShadows._shadowLayer.addChild(shadow);
  };

  Sprite_Character.prototype.removeShadow = function(source) {
    if (source.eventId) {
      var id = source.eventId();
    } else {
      var id = 0;
    }
    if (!this._shadows[id]) return;
    this._shadows[id] = null;
    QuasiSimpleShadows._shadowLayer.removeChild(this._shadows[id]);
  };

  //-----------------------------------------------------------------------------
  // Sprite_CharacterShadow
  //
  // The sprite for displaying a characters shadow

  Sprite_CharacterShadow.prototype = Object.create(Sprite_Character.prototype);
  Sprite_CharacterShadow.prototype.constructor = Sprite_CharacterShadow;

  Sprite_CharacterShadow.prototype.initialize = function(character, source) {
    Sprite_Character.prototype.initialize.call(this, character);
    this.anchor.x = character.shadowAnchorX();
    this.anchor.y = character.shadowAnchorY();
    this.ox = character.shadowOffsetX();
    this.oy = character.shadowOffsetY();
    this._source = source;
    this._sourceRadius = source._simpleShadowRadius;
    this._sourceFlickerStr = source._simpleShadowFlickerStr;
    this._sourceFlickerDelay = source._simpleShadowFlickerDelay;
    this.setBlendColor([0, 0, 0, 255]);
    if (QuasiSimpleShadows.enableBlur) {
      var blur = new PIXI.filters.BlurFilter();
      blur.blur = QuasiSimpleShadows.blurStr;
      this.filters = [blur];
    }
    // Bottom lines are for a gradient mask, though I can't remember how to
    // do an alpha mask in pixi, so it's left out for now
    //var gradient = QuasiSimpleShadows.radialGradient(this._sourceRadius, "black", "transparent");
    //this.addChild(gradient);
    //this.mask = gradient;
  };

  Sprite_CharacterShadow.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    if (!this._source.castsShadows() || !this._character.hasShadow()) {
      this.alpha = 0;
      return;
    }
    this.updateBitmap();
    this.updateFrame();
    this.updatePosition();
    this.updateScaleOpacity();
    this.updateRotation();
    this.updateFlicker();
  };

  Sprite_CharacterShadow.prototype.updatePosition = function() {
    this.x = this._character.screenX() + this.ox;
    this.y = this._character.screenY() - 10 + this.oy;
    this.z = this._character.screenZ() - 1;
  };

  Sprite_CharacterShadow.prototype.updateRotation = function() {
    if (Imported.Quasi_Movement) {
      var x1 = this._character.cx();
      var x2 = this._source.cx();
      var y1 = this._character.cy();
      var y2 = this._source.cy();
    } else {
      var x1 = this._character._realX;
      var x2 = this._source._realX;
      var y1 = this._character._realY;
      var y2 = this._source._realY;
    }
    var radian = Math.atan2(y1 - y2, x1 - x2)
    this.rotation = radian + Math.PI / 2;
  };

  Sprite_CharacterShadow.prototype.updateScaleOpacity = function() {
    if (Imported.Quasi_Movement) {
      var x1 = this._character.cx();
      var x2 = this._source.cx();
      var y1 = this._character.cy();
      var y2 = this._source.cy();
    } else {
      var x1 = this._character._realX * $gameMap.tileWidth();
      var x2 = this._source._realX * $gameMap.tileWidth();
      var y1 = this._character._realY * $gameMap.tileHeight();
      var y2 = this._source._realY * $gameMap.tileHeight();
    }
    var dx = x2 - x1;
    var dy = y2 - y1;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var sLength = this._sourceRadius;
    var size = sLength - distance;
    if (size <= 0) {
      if (QuasiSimpleShadows.enableBlur) {
        this.scale.y = this.scale.y = 0;
      }
      this.alpha = 0;
      // remove here if needed
    } else {
      if (QuasiSimpleShadows.enableZoom) {
        this.scale.y = (size + 48) / sLength;
        this.scale.x = (size + 48) / sLength;
      }
      this.alpha = size / sLength;
    }
  };

  Sprite_CharacterShadow.prototype.updateFlicker = function() {
    if (!this._sourceFlickerStr) return;
    var str = this._sourceFlickerStr;
    var delay = this._sourceFlickerDelay || 1;
    if (!this._flickerDelay) {
      this._flicker = Math.random() * str - str / 2;
    }
    this.scale.y += this._flicker / 100;
    this._flickerDelay = Math.floor(Math.random() * delay);
  };

  //-----------------------------------------------------------------------------
  // Spriteset_Map
  //
  // The set of sprites on the map screen.

  var Alias_Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
  Spriteset_Map.prototype.createCharacters = function() {
    this.createShadowLayer();
    Alias_Spriteset_Map_createCharacters.call(this);
  };

  Spriteset_Map.prototype.createShadowLayer = function() {
    this._tilemap.addChild(QuasiSimpleShadows._shadowLayer);
  };
}(QuasiSimpleShadows));
