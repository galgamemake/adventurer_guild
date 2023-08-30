//============================================================================
// Quasi EZ JSON
// Version: 1.01
// Last Update: November 20, 2015
//============================================================================
// ** Terms of Use
// ** This does not follow my normal terms!!
//  * This is free to use for ALL projects, including commerical.
//    This does not mean you can use any of the plugins this creates a json for
//    for free. You still have to follow the respective plugin's terms.
//  * You are free to modify this script to add in your json formats or
//    create your own editor based off this, I just ask you leave a special
//    thanks to Quasi somewhere.
//============================================================================
// How to install:
//  - Save this file as "QuasiEZJSON.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - - This should be placed below all plugins
//  - - Should Remove / Delete this plugin before deployment
//============================================================================
// Note:
// This plugin should be removed before deployment!
// This plugin will not run on web platform, and should be removed or turnned off
// before testing on web.
//============================================================================

var Imported = Imported || {};
Imported.Quasi_EZJSON = 1.01;

//=============================================================================
 /*:
 * @plugindesc A JSON File editor
 * Version 1.01
 * @author Quasi      Site: http://quasixi.com
 *
 * @help
 * To use, simply turn on this plugin and start the game. And you will start
 * with the editor instead of title screen.
 * Turn off plugin when you do not want to start with editor.
 *
 * To delete / remove a setting, just hover over it and push backspace.
 *
 * If help needed pm me on RPGMaker Web.
 *
 * This script is pretty flexable, and other scripters can add in their
 * own json formats into this editor as well. If your a scripter and want
 * to add in yours feel free to pm me a sample format and I'll create the
 * file object for it. Or you can exmine mine, and modify.
 *
 * =============================================================================
 * Links
 *  - http://quasixi.com/mv/
 *  - https://github.com/quasixi/RPG-Maker-MV
 *  - http://forums.rpgmakerweb.com/index.php?/user/25663-quasi/
 *  - http://forums.rpgmakerweb.com/index.php?/topic/48741-quasi-movement/
 *  - http://forums.rpgmakerweb.com/index.php?/topic/48777-quasi-params-plus/
 */
//=============================================================================

if (!Imported.Quasi_Input) {
  alert("Error: Quasi EzJSON requires Quasi Input to work.");
  throw new Error("Error: Quasi EZJSON requires Quasi Input to work.")
}

(function() {
  var QuasiJSON = {};

  QuasiJSON.setup = function() {
    this.fs = require('fs');
    this.files = {};
    if (Imported.Quasi_ParamsPlus) {
      this.files["Parameters.json"] =
      {
        level: 0,
        wrapper: "array",
        title: "Parameters",
        change: true,
        folder: "data/",
        options:
        {
          level: 1,
          wrapper: "object",
          title: "Parameter Settings",
          last: true,
          keys: ["abr", "name", "default"],
          init: ["", "", 0]
        }
      };
    }
    if (Imported.Quasi_Movement) {
      this.files["RegionBoxes.json"] =
      {
        level: 0,
        wrapper: "object",
        title: "Regions",
        change: true,
        folder: QuasiMovement.jFolder,
        options:
        {
          level: 1,
          wrapper: "array",
          title: "Boxes",
          keyname: "RegionId",
          options:
          {
            level: 2,
            title: "Box Settings",
            last: true,
            wrapper: "object",
            keys: ["width", "height", "ox", "oy", "tag"],
            init: [0, 0, 0, 0, ""]
          }
        }
      };
    }
    if (Imported.Quasi_Depths) {
      this.files["Depths.json"] =
      {
        level: 0,
        wrapper: "object",
        title: "Pixel Regions",
        change: true,
        folder: QuasiMovement.jFolder,
        options:
        {
          level: 1,
          wrapper: "object",
          title: "Depths Setting",
          keyname: "#HexColor",
          last: true,
          keys: ["depth", "zoom", "shiftY"],
          init: [0, 1, 0]
        }
      };
    }


  };
  QuasiJSON.setup();

  QuasiJSON.setPath = function(folder) {
    this._path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, "/" + folder);
    if (this._path.match(/^\/([A-Z]\:)/)) {
      this._path = this._path.slice(1);
    }
    this._path = decodeURIComponent(this._path);
  };

  QuasiJSON.load = function(file) {
    this.file = file;
    this.format = this.files[file];
    this.setPath(this.format.folder);
    this.level = 1;
    if (this.fs.existsSync(this._path + this.file)) {
      this.json = JSON.parse(this.fs.readFileSync(this._path + this.file, 'utf8'));
    } else {
      this.createEmpty();
      this.save();
    }
    return this.json
  };

  QuasiJSON.save = function() {
    if (!this.file) {
      return;
    }
    var newFile = JSON.stringify(this.json, null, 2);
    this.fs.writeFileSync(this._path + this.file, newFile);
  };

  QuasiJSON.close = function() {
    this.file = null;
    this.format = null;
    this.json = null;
  };

  QuasiJSON.createEmpty = function() {
    if (!this.file) {
      return;
    }
    if (this.format.wrapper === "object") {
      this.json = {};
    } else if (this.format.wrapper === "array"){
      this.json = [];
    }
    this.addOptions(this.json, 1);
  };

  QuasiJSON.addOptions = function(json, level) {
    if (!this.file) {
      return;
    }
    var options = this.findLevel(level);
    if (options.wrapper === "object") {
      var id = json.length || this.objectLength(json);
      var keyname = options.keyname || "";
      keyname = keyname + id;
      json[keyname] = {};
      options.keys.forEach(function(key, i) {
        json[keyname][key] = typeof options.init[i] === 'undefied' ? "" : options.init[i];
      });
    } else if (options.wrapper === "array") {
      if (typeof json === "object") {
        var key = options.keyname + this.objectLength(json);
      } else {
        var key = json.length;
      }
      json[key] = [];
      if (options.options) {
        this.addOptions(json[key], level + 1);
      } else {
        json[key] = "";
      }
    }
    this.save();
  };

  QuasiJSON.checkFormat = function(json, level) {
    if (!this.file) {
      return;
    }
    var options = this.findLevel(level);
    if (options.wrapper === "object") {
      options.keys.forEach(function(key) {
        if (!json.hasOwnProperty(key)) {
          json[key] = "";
        }
      });
    }
    this.save();
  };

  QuasiJSON.findLevel = function(level) {
    if (!this.file) {
      return;
    }
    var current = this.format;
    while(true) {
      if (current.level === level) {
        break;
      }
      if (current.options) {
        current = current.options;
      } else {
        break;
      }
    }
    return current;
  };

  QuasiJSON.objectLength = function(obj) {
    var length = 0;
    for (var key in obj) {
      if (obj.hasOwnProperty(key)){
        length++;
      }
    }
    return length;
  };

  QuasiJSON.clean = function(string) {
    // Can add extra stuff here to clean the string
    // in case you don't want some special characters and stuff
    if (this.format.change) {
      if (/^-?[0-9]+$/.test(string)) {
        return Number(string || 0);
      }
      if (/^true$/.test(string)) {
        return true;
      }
      if (/^false$/.test(string)) {
        return false;
      }
    }
    return string;
  };

  //-----------------------------------------------------------------------------
  // Scene_Boot
  //
  // The scene class for initializing the entire game.

  var Alias_Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    if (QuasiJSON.objectLength(QuasiJSON.files) === 0) {
      console.log("Quasi EZJSON was skiped because no Quasi JSON requiring plugins were found.");
      alert("Quasi EZJSON was skiped because no Quasi plugins requiring JSON were found.");
      return Alias_Scene_Boot_start.call(this);
    }
    if (DataManager.isBattleTest() || DataManager.isEventTest()) {
      return Alias_Scene_Boot_start.call(this);
    } else {
      DataManager.setupNewGame();
      Scene_Base.prototype.start.call(this);
      SceneManager.goto(Scene_QuasiJSON);
      this.updateDocumentTitle();
    }
  };

  //-----------------------------------------------------------------------------
  // Scene_QuasiJSON
  //
  // The scene class for the Quasi EZ JSON screen.

  function Scene_QuasiJSON() {
    this.initialize.apply(this, arguments);
  }

  Scene_QuasiJSON.prototype = Object.create(Scene_Base.prototype);
  Scene_QuasiJSON.prototype.constructor = Scene_QuasiJSON;

  Scene_QuasiJSON.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
  };

  Scene_QuasiJSON.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer();
    this.createWindows();
  };

  Scene_QuasiJSON.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    if (this._fileWindow.active) {
      if (Input.isTriggered('#backspace')) {
        if (this._file[this._fileWindow.currentName()] && !this._final) {
          if (this._file.constructor === Array) {
            this._file.splice (this._fileWindow.currentName(), 1);
          } else {
            console.log(this._fileWindow.currentName());
            delete this._file[this._fileWindow.currentName()];
          }
          QuasiJSON.save();
          this._fileWindow.setList(this._file, this._final);
        }
      }
    }
  };

  Scene_QuasiJSON.prototype.createWindows = function() {
    this._fileWindow = new Window_QuasiFileList();
    this._fileWindow.setHandler('file', this.commandLoadFile.bind(this));
    this._fileWindow.setHandler('exit', this.commandExit.bind(this));
    this._fileWindow.setHandler('cancel', this.commandBack.bind(this));
    this._fileWindow.setHandler('add',  this.commandAdd.bind(this));
    this._fileWindow.setHandler('edit', this.commandEdit.bind(this));
    this._fileWindow.setHandler('next', this.commandNext.bind(this));
    this.addWindow(this._fileWindow);

    this._fileHeader = new Window_QuasiFileHeader();
    this._fileHeader.setText("JSON List");
    this._fileWindow.fileHeader = this._fileHeader;
    this._fileWindow.updatePlacement();
    this.addWindow(this._fileHeader);

    this._inputWindow = new Window_TextInput();
    this._inputWindow.setHandler('#enter', this.commandSetInput.bind(this));
    this._inputWindow.setHandler('#esc', this.commandExitInput.bind(this));
    this._inputWindow.setDefault("", 30);
    this._inputWindow.center();
    this._inputWindow.hide();
    this.addWindow(this._inputWindow);
  };

  Scene_QuasiJSON.prototype.commandLoadFile = function() {
    this._file   = QuasiJSON.load(this._fileWindow.currentName());
    this._format = QuasiJSON.findLevel(1);
    this._levels = [];
    this._level  = 1;
    this._fileHeader.setText(QuasiJSON.findLevel(0).title);
    this._fileWindow.setList(this._file, false);
    this._fileWindow.select(0);
  };

  Scene_QuasiJSON.prototype.commandExit = function() {
    QuasiJSON.close();
    Alias_Scene_Boot_start.call(Scene_Boot.prototype);
  };

  Scene_QuasiJSON.prototype.commandBack = function() {
    if (!this._level) {
      QuasiJSON.close();
      this.commandExit();
      return;
    }
    this._level--;
    if (this._level === 0) {
      QuasiJSON.close();
      this._fileWindow.reset();
    } else {
      this._final = false;
      this._fileHeader.setText(QuasiJSON.findLevel(this._level - 1).title);
      this._file = this._levels.pop();
      this._fileWindow.setList(this._file, false);
    }
  };

  Scene_QuasiJSON.prototype.commandAdd = function() {
    QuasiJSON.addOptions(this._file, this._level);
    var final = this._level !== this._format.level;
    this._fileWindow.setList(this._file, final);
  };

  Scene_QuasiJSON.prototype.commandEdit = function() {
    this._fileWindow.deactivate();
    var current = this._file[this._fileWindow.currentName()];
    this._inputWindow.setDefault(current, 30);
    this._inputWindow.show();
    this._inputWindow.activate();
  };

  Scene_QuasiJSON.prototype.commandNext = function() {
    this._level++;
    this._levels.push(this._file);
    this._format = QuasiJSON.findLevel(this._level);
    this._fileHeader.setText(QuasiJSON.findLevel(this._level - 1).title);
    this._final = this._level !== this._format.level;
    this._file = this._file[this._fileWindow.currentName()];
    if (this._final) {
      QuasiJSON.checkFormat(this._file, this._level);
    }
    this._fileWindow.setList(this._file, this._final);
    this._fileWindow.select(0);
  };

  Scene_QuasiJSON.prototype.commandExitInput = function() {
    this._inputWindow.hide();
    this._fileWindow.activate();
  };

  Scene_QuasiJSON.prototype.commandSetInput = function() {
    this._inputWindow.hide();
    this._inputWindow.deactivate();
    this._fileWindow.activate();
    var text = QuasiJSON.clean(this._inputWindow.text());
    this._file[this._fileWindow.currentName()] = text;
    QuasiJSON.save();
    this._fileWindow.refresh();
  };

  //-----------------------------------------------------------------------------
  // Window_QuasiFileList
  //
  // The window for selecting New Game/Continue on the title screen.

  function Window_QuasiFileList() {
    this.initialize.apply(this, arguments);
  }

  Window_QuasiFileList.prototype = Object.create(Window_Command.prototype);
  Window_QuasiFileList.prototype.constructor = Window_QuasiFileList;

  Window_QuasiFileList.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.updatePlacement();
  };

  Window_QuasiFileList.prototype.windowWidth = function() {
    return 480;
  };

  Window_QuasiFileList.prototype.windowHeight = function() {
      return Math.min(this.fittingHeight(this.numVisibleRows()), Graphics.height - 72);
  };

  Window_QuasiFileList.prototype.updatePlacement = function() {
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = (Graphics.boxHeight - this.height) / 2 + 72;
    if (this.fileHeader) {
      this.fileHeader.y = this.y - 72;
      this.fileHeader.x = this.x;
    }
  };

  Window_QuasiFileList.prototype.currentName = function() {
    return this.currentData().name;
  };

  Window_QuasiFileList.prototype.makeCommandList = function() {
    if (this._file) {
      this.makeFileOptionsList();
      return;
    }
    for (var file in QuasiJSON.files) {
      if (QuasiJSON.files.hasOwnProperty(file)) {
        this.addCommand(file, "file");
      }
    }
    this.addCommand("Exit", "exit");
  };

  Window_QuasiFileList.prototype.makeFileOptionsList = function() {
    for (var key in this._file) {
      if (this._file.hasOwnProperty(key)){
        this.addCommand(key, this._final ? "edit" : "next");
      }
    }
    if (!this._final) {
      this.addCommand("New", "add");
    }
    this.addCommand("Back", "cancel");
  };

  Window_QuasiFileList.prototype.setList = function(file, final) {
    this._file = file;
    this._final = final;
    this.refresh();
    this.height = this.windowHeight();
    this.refresh(); // refresh again for height
    this.fileHeader.refresh();
    this.updatePlacement();
    this.activate();
    this.select(0);
  };

  Window_QuasiFileList.prototype.reset = function() {
    this.fileHeader.setText("JSON List");
    this._file = null;
    this._final = null;
    this.refresh();
    this.height = this.windowHeight();
    this.refresh(); // refresh again for height
    this.updatePlacement();
    this.select(0);
    this.activate();
  };

  Window_QuasiFileList.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    var name = this.commandName(index);
    if (this._file && this._file.constructor === Array && this._file[index]) {
      name = JSON.stringify(this._file[index]).slice(0, 27);
      name += "..."
    }
    if (this._final && typeof this._file[name] !== "undefined") {
      this.drawText(this._file[name], rect.x, rect.y, rect.width, 'right');
      name += ": ";
    }
    this.drawText(name, rect.x, rect.y, rect.width, align);
  };

  //-----------------------------------------------------------------------------
  // Window_QuasiFileHeader
  //
  // The window for displaying the QuasiFileHeader.

  function Window_QuasiFileHeader() {
      this.initialize.apply(this, arguments);
  }

  Window_QuasiFileHeader.prototype = Object.create(Window_Base.prototype);
  Window_QuasiFileHeader.prototype.constructor = Window_QuasiFileHeader;

  Window_QuasiFileHeader.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    this.text;
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.refresh();
  };

  Window_QuasiFileHeader.prototype.windowWidth = function() {
    return 480;
  };

  Window_QuasiFileHeader.prototype.windowHeight = function() {
    return this.fittingHeight(1);
  };

  Window_QuasiFileHeader.prototype.refresh = function() {
    this.createContents();
    var x = this.textPadding();
    var width = this.contents.width - this.textPadding() * 2;
    this.contents.clear();
    this.drawText(this.text, 0, 0, width, 'center');
  };

  Window_QuasiFileHeader.prototype.setText = function(text) {
    if (!text) {
      return;
    }
    this.text = text;
    this.refresh();
  };
})();
