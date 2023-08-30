//=============================================================================
// Quasi Item Scene
// Version: 1.01
// Last Update: June 4, 2016
//=============================================================================
// ** Terms of Use
// hhttps://github.com/quasixi/Quasi-MV-Master-Demo/blob/master/README.md
//=============================================================================
// Downloading from Github
//  - Click on Raw next to Blame and History
//  - Once new page loads, right click and save as
//=============================================================================
// How to install:
//  - Save this file as "QuasiItemScene.js" in your js/plugins/ folder
//  - Configure as needed
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://quasixi.com/quasi-item-scene/
//  - - RMWLink
//=============================================================================

var Imported = Imported || {};
Imported.QuasiItemScene = 1.01;

//=============================================================================
 /*:
 * @plugindesc Customizes the Item Scene
 * Version 1.01
 * <QuasiItemScene>
 * @author Quasi       Site: http://quasixi.com
 *
 * @param Show Help
 * @desc Show the help window?
 * Set to true or false
 * @default true
 *
 * @param Show Categories
 * @desc Show the category window?
 * Set to true or false
 * @default true
 *
 * @param Categories Columns
 * @desc Set the number of columns in the item window.
 * Default: 4
 * @default 4
 *
 * @param Item Columns
 * @desc Set the number of columns in the item window.
 * Default: 2
 * @default 2
 *
 * @param Item Spacing
 * @desc Set the spacing between items in the item window.
 * Default: 48
 * @default 48
 *
 * @param Item Format
 * @desc Set the format for displaying items in the item window.
 * Default: <icon><name>:<amt>
 * @default <icon><name>:<amt>
 *
 * @param Item Background
 * @desc Set the name of the image to use as a background
 * If left blank, windowskins will be used instead.
 * @default
 *
 * @param =====================
 * @desc Spacer
 * @default
 *
 * @param Actor Window Width
 * @desc Set the width for the actor Window. Can use JS
 * Default: Graphics.boxWidth - 240
 * @default Graphics.boxWidth - 240
 *
 * @param Actor Window Height
 * @desc Set the height for the actor Window. Can use JS
 * Default: Graphics.boxHeight
 * @default Graphics.boxHeight
 *
 * @param Actor Window X
 * @desc Set the x for the actor Window.
 * Default: 0
 * @default 0
 *
 * @param Actor Window Y
 * @desc Set the y for the actor Window.
 * Default: 0
 * @default 0
 *
 * @param Actor Window BG
 * @desc Set the name of the image to use as a background
 * If left blank, windowskins will be used instead.
 * @default
 *
 * @help
 * ============================================================================
 * ** Links
 * ============================================================================
 * For a guide on how to use this plugin go to:
 *
 *   http://quasixi.com/quasi-item-scene/
 *
 * Other Links
 *  - https://github.com/quasixi/Quasi-MV-Master-Demo
 *  - RMWLink
 * ============================================================================
 */
//=============================================================================

//-----------------------------------------------------------------------------
// New Classes

function Window_ItemPage() {
  this.initialize.apply(this, arguments);
}

function Window_QItemList() {
  this.initialize.apply(this, arguments);
}


//-----------------------------------------------------------------------------
// Quasi Item Adv Info

var QuasiItemScene = {};
(function() {
  var _params = $plugins.filter(function(p) { return p.description.contains('<QuasiItemScene>') && p.status; })[0].parameters;
  QuasiItemScene.showHelp = _params["Show Help"] === "true";
  QuasiItemScene.showCategories = _params["Show Categories"] === "true";
  QuasiItemScene.categoriesCols = Number(_params["Categories Columns"]) || 4;
  QuasiItemScene.itemCols = Number(_params["Item Columns"]) || 1;
  QuasiItemScene.itemFormat = _params["Item Format"];
  QuasiItemScene.itemSpacing = Number(_params["Item Spacing"]) || 0;
  QuasiItemScene.itemBG = _params["Item Background"];

  QuasiItemScene.actorWWidth  = _params["Actor Window Width"] || "Graphics.boxWidth - 240";
  QuasiItemScene.actorWHeight = _params["Actor Window Height"] || "Graphics.boxHeight";
  QuasiItemScene.actorWX  = Number(_params["Actor Window X"]) || 0;
  QuasiItemScene.actorWY  = Number(_params["Actor Window Y"]) || 0;
  QuasiItemScene.actorWBG = _params["Actor Window BG"];

  //-----------------------------------------------------------------------------
  // Scene_Item
  //
  // The scene class of the item screen.

  var Alias_Scene_Item_create = Scene_Item.prototype.create;
  Scene_Item.prototype.create = function() {
    Alias_Scene_Item_create.call(this);
    this.reformatWindows();
  };

  var Alias_Scene_Item_createBackground = Scene_Item.prototype.createBackground;
  Scene_Item.prototype.createBackground = function() {
    Alias_Scene_Item_createBackground.call(this);
    if (QuasiItemScene.itemBG) {
      this._backgroundSprite2 = new Sprite();
      this._backgroundSprite2.bitmap = ImageManager.loadPicture(QuasiItemScene.itemBG);
      this.addChild(this._backgroundSprite2);
    }
  };

  Scene_Item.prototype.createItemWindow = function() {
    var wy = this._categoryWindow.y + this._categoryWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_QItemList(0, wy, Graphics.boxWidth, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
    this._categoryWindow.setItemWindow(this._itemWindow);
    this.createItemInfoWindow();
  };

  Scene_Item.prototype.createItemInfoWindow = function() {
    var w = Graphics.boxWidth / 2;
    var h1 = this._itemWindow.height;
    var y1 = this._itemWindow.y;
    this._itemInfoWindow = new Window_ItemPage(w, y1, w, h1);
    this._itemWindow.setAdvInfoWindow(this._itemInfoWindow);
    this.addWindow(this._itemInfoWindow);
  };

  var Alias_Scene_Item_createActorWindow = Scene_Item.prototype.createActorWindow;
  Scene_Item.prototype.createActorWindow = function() {
    if (QuasiItemScene.actorWBG) {
      this._backgroundSprite3 = new Sprite();
      this._backgroundSprite3.bitmap = ImageManager.loadPicture(QuasiItemScene.actorWBG);
      this._backgroundSprite3.alpha = 0;
      this.addChild(this._backgroundSprite3);
    }
    Alias_Scene_Item_createActorWindow.call(this);
  };

  Scene_Item.prototype.reformatWindows = function() {
    var oy1 = 0;
    var oy2 = 0;
    if (!QuasiItemScene.showHelp) {
      oy1 = this._helpWindow.height;
      this._helpWindow.hide();
      this._categoryWindow.y -= oy1;
      this._itemWindow.y -= oy1;
      this._itemInfoWindow.y -= oy1;
    }
    if (!QuasiItemScene.showCategories) {
      oy2 = this._categoryWindow.height;
      this._categoryWindow.hide();
      this._itemWindow.y -= oy2;
      this._itemInfoWindow.y -= oy2;
    }
    var w = Graphics.boxWidth / 2;
    this._itemWindow.height += oy1 + oy2;
    this._itemInfoWindow.height += oy1 + oy2;
    this._itemWindow.width = w;
    this._itemWindow.refresh();
    if (!QuasiItemScene.showCategories) {
      this._categoryWindow.deactivate();
      this._itemWindow.activate();
      this._itemWindow.select(0);
    }
    this._actorWindow.height = new Function('return ' + QuasiItemScene.actorWHeight)();
    this._actorWindow.width  = new Function('return ' + QuasiItemScene.actorWWidth)();
    this._actorWindow.x = QuasiItemScene.actorWX;
    this._actorWindow.y = QuasiItemScene.actorWY;
    this._actorWindow.refresh();
    if (QuasiItemScene.actorWBG) {
      this._actorWindow.opacity = 0;
    }
    if (QuasiItemScene.itemBG) {
      this._itemWindow.opacity = 0;
      this._categoryWindow.opacity = 0;
      this._itemInfoWindow.opacity = 0;
    }
  };

  Scene_Item.prototype.addWindow = function(window) {
    if ((window === this._actorWindow && QuasiItemScene.actorWBG)) {
      this.addChild(window);
      return;
    }
    Scene_ItemBase.prototype.addWindow.call(this, window);
  };

  Scene_Item.prototype.isCursorLeft = function() {
    return false;
  };

  Scene_Item.prototype.showSubWindow = function(window) {
    window.x = this.isCursorLeft() ? Graphics.boxWidth - window.width : window.x;
    window.show();
    window.activate();
    if (window === this._actorWindow && this._backgroundSprite3) {
      this._backgroundSprite3.alpha = 1;
    }
  };

  Scene_Item.prototype.hideSubWindow = function(window) {
    Scene_ItemBase.prototype.hideSubWindow.call(this, window);
    if (window === this._actorWindow && this._backgroundSprite3) {
      this._backgroundSprite3.alpha = 0;
    }
  };

  var Alias_Scene_Item_onItemCancel = Scene_Item.prototype.onItemCancel;
  Scene_Item.prototype.onItemCancel = function() {
    if (!QuasiItemScene.showCategories) {
      this.popScene();
      return;
    }
    Alias_Scene_Item_onItemCancel.call(this);
  };

  //-----------------------------------------------------------------------------
  // Window_ItemCategory
  //
  // The window for selecting a category of items on the item and shop screens.

  Window_ItemCategory.prototype.maxCols = function() {
    return QuasiItemScene.categoriesCols;
  };

  //-----------------------------------------------------------------------------
  // Window_ItemList
  //
  // The window for selecting an item on the item screen.

  Window_QItemList.prototype = Object.create(Window_ItemList.prototype);
  Window_QItemList.prototype.constructor = Window_QItemList;

  Window_QItemList.prototype.maxCols = function() {
    return QuasiItemScene.itemCols;
  };

  Window_QItemList.prototype.spacing = function() {
      return QuasiItemScene.itemSpacing;
  };

  Window_QItemList.prototype.includes = function(item) {
    if (!QuasiItemScene.showCategories) {
      return true;
    }
    return Window_ItemList.prototype.includes.call(this, item);
  };

  Window_QItemList.prototype.updateHelp = function() {
    Window_ItemList.prototype.updateHelp.call(this);
    this.setAdvInfoItem(this.item());
  };

  Window_QItemList.prototype.setAdvInfoWindow = function(window) {
    this._pageWindow = window;
    this.callUpdateHelp();
  };

  Window_QItemList.prototype.setAdvInfoItem = function(item) {
    if (this._pageWindow) {
      this._pageWindow.setItem(item);
    }
  };

  Window_QItemList.prototype.drawItem = function(index) {
    var item = this._data[index];
    if (item) {
      var rect = this.itemRect(index);
      rect.width -= this.textPadding();
      var x = rect.x;
      var y = rect.y;
      var w = rect.width;
      this.changePaintOpacity(this.isEnabled(item));
      this.drawFormatText(item, x, y, w);
      this.changePaintOpacity(1);
    }
  };

  Window_QItemList.prototype.drawFormatText = function(item, x, y, w) {
    var format = QuasiItemScene.itemFormat;
    var code = "";
    var checking = false;
    var currentX = x + 2;
    for (var i = 0; i < format.length; i++) {
      if (format[i] === "<") {
        checking = true;
        continue;
      }
      if (format[i] === ">") {
        if (code === "icon") {
          this.drawIcon(item.iconIndex, currentX, y + 2);
          currentX += Window_Base._iconWidth + 4;
        }
        if (code === "name") {
          this.drawText(item.name, currentX, y, w);
          currentX += this.textWidth(item.name);
        }
        if (code === "amt") {
          this.drawText($gameParty.numItems(item), currentX, y, w);
          currentX += this.textWidth($gameParty.numItems(item));
        }
        checking = false;
        code = "";
        continue;
      }
      if (checking) {
        code += format[i];
      } else {
        this.drawText(format[i], currentX, y, w);
        currentX += this.textWidth(format[i]);
      }
    }
  };

  //-----------------------------------------------------------------------------
  // Window_ItemPage
  //
  // The window for displaying advanced info of items.

  Window_ItemPage.prototype = Object.create(Window_Base.prototype);
  Window_ItemPage.prototype.constructor = Window_ItemPage;

  Window_ItemPage.prototype.initialize = function(x, y, w, h) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._item = null;
    this._pages = [];
    this._pageNumber = 0;
  };

  Window_ItemPage.prototype.setItem = function(item) {
    this._item = item;
    this._page = null;
    if (item) {
      var notes = item.note;
      var match = /<itempage(\d+)>([\s\S]*?)<\/itempage>/i.exec(notes);
      while (match) {
        this._pages[Number(match[1]) - 1] = match[2].split("\n");
        this._pages[Number(match[1]) - 1].shift();
        notes = notes.replace(match[2], "");
        notes = notes.replace(new RegExp("<itempage" + match[1] + "></itempage>", "i"), "");
        match = /<itempage(\d+)>([\s\S]*?)<\/itempage>/i.exec(notes);
      }
    }
    this.refresh();
  };

  Window_ItemPage.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (Input.isTriggered("pageup")) {
      this.nextPage();
    }
    if (Input.isTriggered("pagedown")) {
      this.prevPage();
    }
  };

  Window_ItemPage.prototype.nextPage = function() {
    if (this._pageNumber === this._pages.length - 1) {
      this._pageNumber = 0;
    } else {
      this._pageNumber++;
    }
    this.refresh();
  };

  Window_ItemPage.prototype.prevPage = function() {
    if (this._pageNumber === 0) {
      this._pageNumber = this._pages.length - 1;
    } else {
      this._pageNumber--;
    }
    this.refresh();
  };

  Window_ItemPage.prototype.refresh = function() {
    this.contents.clear();
    if (this._pages[this._pageNumber]) {
      this.drawPage();
    }
  };

  Window_ItemPage.prototype.drawPage = function() {
    var item = this._item;
    var pg   = this._pages[this._pageNumber];
    var currentY = 0;
    var currentX = 0;
    for (var i = 0; i < pg.length; i++) {
      var code = "";
      var checking = false;
      var line = pg[i];
      this.drawTextEx(line, 0, currentY);
      currentY += this.lineHeight();
    }
  };

  Window_ItemPage.prototype.processCode = function(code, dataId, value1, value2) {
    // To add in? Maybe?
    var string = "";
    var params = ["Max HP", "Max MP", "Attack", "Defense", "M.Attack", "M.Defense", "Agility", "Luck"];
    switch (code) {
      case 11: // HP
        string += "Recover HP: ";
        if (value1) {
          string += value1 * 100 + "% ";
        }
        if (value2) {
          string += value2;
        }
        break;
      case 12: // MP
        string += "Recover MP: ";
        if (value1) {
          string += value1 * 100 + "% ";
        }
        if (value2) {
          string += value2;
        }
        break;
      case 13: // TP
        string += "Recover TP: ";
        string += value1;
        break;
      case 21: // Add states
        var state = $dataStates[dataId];
        if (state) {
          string += "Add State: " + state.name + (value1 * 100) + "%";
        }
        break;
      case 22: // Remove States
      var state = $dataStates[dataId];
        if (state) {
          string += "Remove State: " + state.name + (value1 * 100) + "%";
        }
        break;
      case 31: // Add Buff
        string += "Add Buff: " + params[dataId];
        string += " " + value1 + " turns.";
        break;
      case 32: // Debuff
        string += "Add Debuff: " + params[dataId];
        string += " " + value1 + " turns.";
        break;
      case 33: // Remove Buff
        string += "Remove Buff: " + params[dataId];
        break;
      case 34: // Remove Debuff
        string += "Remove Debuff: " + params[dataId];
        break;
      case 41: // Special Effect
        break;
      case 42: // Grow
        string += "Grow " + params[dataId] + " " + value1;
        break;
      case 43: // Learn Skill
        string += "Learn Skill: ";
        var skill = $dataSkills[dataId];
        if (skill) {
          string += skill.name;
        }
        break;
    }
    return string;
  };
}());
