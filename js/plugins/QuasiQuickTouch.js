//=============================================================================
// Quasi Quick Touch
// Version: 1.01
// Last Update: May 25, 2016
//=============================================================================
// ** Terms of Use
// https://github.com/quasixi/Quasi-MV-Master-Demo/blob/master/README.md
//=============================================================================
// Downloading from Github
//  - Click on Raw next to Blame and History
//  - Once new page loads, right click and save as
//=============================================================================
// How to install:
//  - Save this file as "QuasiQuickTouch.js" in your js/plugins/ folder
//=============================================================================

var Imported = Imported || {};
Imported.QuasiQuickTouch = 1.01;

//=============================================================================
 /*:
 * @plugindesc Select windows activate on single click
 * Version 1.01
 * <QuasiQuickTouch>
 * @author Quasi       Site: http://quasixi.com
 */
//=============================================================================

//-----------------------------------------------------------------------------
// Quasi Quick Touch

(function() {

  TouchInput._onMouseMove = function(event) {
    var x = Graphics.pageToCanvasX(event.pageX);
    var y = Graphics.pageToCanvasY(event.pageY);
    this._onMove(x, y);
  };

  //-----------------------------------------------------------------------------
  // Window_Selectable
  //
  // The window class with cursor movement and scroll functions.

  var Alias_Window_Selectable_initialize = Window_Selectable.prototype.initialize;
  Window_Selectable.prototype.initialize = function(x, y, width, height) {
    Alias_Window_Selectable_initialize.call(this, x, y, width, height);
    this._oldTouchX = TouchInput.x;
    this._oldTouchY = TouchInput.y;
  };

  Window_Selectable.prototype.processTouch = function() {
    if (this.isOpenAndActive()) {
      if (this.isTouchedInsideFrame()) {
        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        var hitIndex = this.hitTest(x, y);
        if (hitIndex >= 0 && this.isCursorMovable() && this.mouseMoved()) {
          this.select(hitIndex);
        }
        if (TouchInput.isTriggered()) {
          if (hitIndex >= 0) {
            if (hitIndex === this.index() && this.isTouchOkEnabled()) {
              this.processOk();
            }
          }
        }
      }
      if (TouchInput.isCancelled()) {
        if (this.isCancelEnabled()) {
          this.processCancel();
        }
      }
    }
  };

  Window_Selectable.prototype.mouseMoved = function() {
    if (this._oldTouchX !== TouchInput.x || this._oldTouchY !== TouchInput.y) {
      this._oldTouchX = TouchInput.x;
      this._oldTouchY = TouchInput.y;
      return true;
    }
    return false;
  };
}());
