//============================================================================
// Quasi Stage
// Version: 1.00
// Last Update: Novemeber 23, 2015
//============================================================================
// This plugin puts all Windows on their own renderer. Doing this will
// allow you to use PIXI classes without having to cache them as bitmaps.
//============================================================================
// ** Terms of Use
// ** This does not follow my normal terms!!
//  * This is free to use for ALL projects, including commerical.
//    This does not mean you can use any of the plugins this creates a json for
//    for free. You still have to follow the respective plugin's terms.
//============================================================================
// How to install:
//  - Save this file as "QuasiStage.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - - Place somewhere above any Plugin that requires this.
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://quasixi.com/mv/
//  - - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
//============================================================================

var Imported = Imported || {};
Imported.Quasi_Stage = 1.0;

var QuasiStage = new PIXI.Stage();
QuasiStage.interactive = false;

(function() {
  var Alias_Graphics_render = Graphics.render;
  Graphics.render = function(stage) {
    if (QuasiStage) {
      this._windowRenderer.render(QuasiStage);
    }
    Alias_Graphics_render.call(this, stage);
  };

  var Alias_Graphics_createAllElements = Graphics._createAllElements;
  Graphics._createAllElements = function() {
    Alias_Graphics_createAllElements.call(this);
    this._createWindowCanvas();
    this._createWindowRenderer();
  };

  var Alias_Graphics_updateAllElements = Graphics._updateAllElements;
  Graphics._updateAllElements = function() {
    Alias_Graphics_updateAllElements.call(this);
    this._updateWindowCanvas();
    this._updateWindowRenderer();
  };

  Graphics._createWindowCanvas = function() {
    this._windowCanvas = document.createElement('canvas');
    this._windowCanvas.id = 'PixiCanvas';
    this._updateWindowCanvas();
    document.body.appendChild(this._windowCanvas);
  };

  Graphics._updateWindowCanvas = function() {
    this._windowCanvas.width = this._width;
    this._windowCanvas.height = this._height;
    this._windowCanvas.style.zIndex = 1;
    this._centerElement(this._windowCanvas);
  };

  Graphics._createWindowRenderer = function() {
    PIXI.dontSayHello = true;
    var width = this._width;
    var height = this._height;
    var options = { view: this._windowCanvas, transparent: true };
    try {
      switch (this._windowRendererType) {
      case 'canvas':
        this._windowRenderer = new PIXI.CanvasRenderer(width, height, options);
        break;
      case 'webgl':
        this._windowRenderer = new PIXI.WebGLRenderer(width, height, options);
        break;
      default:
        this._windowRenderer = PIXI.autoDetectRenderer(width, height, options);
        break;
      }
    } catch (e) {
      this._windowRenderer = null;
    }
  };

  Graphics._updateWindowRenderer = function() {
    if (this._windowRenderer) {
      this._windowRenderer.resize(this._width, this._height);
    }
  };

  Scene_Base.prototype.createWindowLayer = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._windowLayer = new WindowLayer();
    this._windowLayer.move(x, y, width, height);
    this._allWindows = [];
    this._allWindows.push(this._windowLayer);
    QuasiStage.addChild(this._windowLayer);
  };

  var Alias_Scene_Base_updateChildren = Scene_Base.prototype.updateChildren;
  Scene_Base.prototype.updateChildren = function() {
    Alias_Scene_Base_updateChildren.call(this);
    QuasiStage.children.forEach(function(child) {
      if (child.update) {
        child.update();
      }
    });
  };

  var Alias_Scene_Base_terminate = Scene_Base.prototype.terminate;
  Scene_Base.prototype.terminate = function() {
    Alias_Scene_Base_terminate.call(this);
      if (this._allWindows) {
      this._allWindows.forEach(function(child) {
        QuasiStage.removeChild(child);
      });
    }
  };
})();
