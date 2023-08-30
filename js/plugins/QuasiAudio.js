//=============================================================================
// Quasi Audio
// Version: 1.03
// Last Update: August 7, 2016
//=============================================================================
// ** Terms of Use
// https://github.com/quasixi/Quasi-MV-Master-Demo/blob/master/README.md
//=============================================================================
// Downloading from Github
//  - Click on Raw next to Blame and History
//  - Once new page loads, right click and save as
//=============================================================================
// How to install:
//  - Save this file as "QuasiAudio.js" in your js/plugins/ folder
//=============================================================================

var Imported = Imported || {};
Imported.QuasiAudio = 1.03;

//=============================================================================
 /*:
 * @plugindesc v1.03 Quasi Audio
 * @author Quasi
 *
 * @help
 * This plugin lets you play audio at a certain location. The audios
 * volume and pan will be determined based off the players distance
 * from the audio location. Audio can also be binded to an event.
 *
 * Plugin Commands:
 * Play a Q Audio at X Y:
 *     qaudio play ID TYPE AUDIO MAXVOLUME RADIUS X Y
 *   To loop the audio:
 *     qaudio loop ID TYPE AUDIO MAXVOLUME RADIUS X Y
 *
 * Play a Q Audio at event location ( follows event )
 *     qaudio play ID TYPE AUDIO MAXVOLUME RADIUS EVENTID
 *   To loop the audio:
 *     qaudio loop ID TYPE AUDIO MAXVOLUME RADIUS EVENTID
 *
 *   ID - A Unique ID for the audio, can be a number or letter.
 *        Used for stopping the audio
 *   TYPE - bgm, bgs, me, or se
 *   AUDIO - The filename of the audio to play
 *   MAXVOLUME - The max volume of the audio when play is directly on the audio
 *               location. From 0 - 100
 *   RADIUS - The tile distance the audio can be heard
 *   X - The grid X Location for the audio
 *   Y - The grid Y Location for the audio
 *   EVENTID - The event ID to bind the audio to
 *
 * Stop a Q Audio
 *     qaudio stop ID
 *   ID - The unique ID you set when playing the Q Audio.
 */
//=============================================================================

//-----------------------------------------------------------------------------
// Quasi Audio

(function() {

  //-----------------------------------------------------------------------------
  // Game_Interpreter
  //
  // The interpreter for running event commands.

  var Alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (command.toLowerCase() === "qaudio") {
      if (args[0].toLowerCase() === "loop" || args[0].toLowerCase() === "play") {
        var loop = args[0].toLowerCase() === "loop";
        var id = args[1];
        if (id === "*") {
          id = "*0";
          var counter = 0;
          var newId = false;
          while(!newId) {
            if (AudioManager._QAudioBuffers.length === 0) {
              newId = true;
              break;
            }
            counter++;
            id = "*" + counter;
            var j = 0;
            for (var i = 0; i < AudioManager._QAudioBuffers.length; i++) {
              if (AudioManager._QAudioBuffers[i].uid !== id) {
                j++
              }
            }
            newId = j === i;
          }
        }
        var type = args[2].toLowerCase();
        var audio = {
          name: args[3],
          volume: 100,
          pitch: 0,
          pan: 0
        }
        var max = Number(args[4]) / 100;
        var r = Number(args[5]);
        var x = Number(args[6]);
        var y = Number(args[7]);
        var bindTo = null;
        if (!y && y !== 0) {
          if (x === 0) {
            bindTo = $gamePlayer;
          } else {
            bindTo = $gameMap.event(x);
          }
          x = null;
          y = null;
        }
        AudioManager.playQAudio(id, type, audio, loop, max, r, x, y, bindTo);
        return;
      }
      if (args[0].toLowerCase() === "stop") {
        var id = args[1];
        AudioManager.stopQAudio(id);
        return;
      }
    }
    Alias_Game_Interpreter_pluginCommand.call(this, command, args);
  };

  //-----------------------------------------------------------------------------
  // AudioManager
  //
  // The static class that handles BGM, BGS, ME and SE.

  AudioManager._QAudioBuffers = [];

  // Duplicate of the AudioManager.createNewBuffer from rpg_managers.js
  // TDDP PreloadManager overrides this to cache, but that will not
  // let you use multiple of the same audio file, so I copied this function over
  AudioManager.createNewBuffer = function(folder, name) {
    var ext = this.audioFileExt();
    var url = this._path + folder + '/' + encodeURIComponent(name) + ext;
    if (this.shouldUseHtml5Audio() && folder === 'bgm') {
      Html5Audio.setup(url);
      return Html5Audio;
    } else {
      return new WebAudio(url);
    }
  };

  AudioManager.playQAudio = function(id, type, audio, loop, maxVolume, r, x, y, bindTo) {
    if (audio.name) {
      this._QAudioBuffers = this._QAudioBuffers.filter(function(audio) {
        if (audio.uid === id) {
          audio.stop();
          audio = null;
          return false;
        }
        return audio._autoPlay || audio.isPlaying();
      });
      var buffer = this.createNewBuffer(type, audio.name);
      if (bindTo) {
        Object.defineProperty(buffer, 'mapX', {
          get: function() {
            return bindTo._realX;
          }
        });
        Object.defineProperty(buffer, 'mapY', {
          get: function() {
            return bindTo._realY;
          }
        });
      } else {
        buffer.mapX = x;
        buffer.mapY = y;
      }
      buffer.uid = id;
      buffer.radius = r;
      buffer.maxVolume = maxVolume;
      this.updateQAudioDistance(buffer);
      buffer.play(loop, 0);
      if (!loop) {
        buffer.addStopListener(this.stopQAudio.bind(this, id));
      }
      this._QAudioBuffers.push(buffer);
    }
  };

  AudioManager.stopQAudio = function(id) {
    var buffers = this._QAudioBuffers;
    for (var i = buffers.length - 1; i >= 0; i--) {
      if (buffers[i].uid === id) {
        buffers[i].stop();
        buffers[i] = null;
        buffers.splice(i, 1);
      }
    }
  };

  AudioManager.updateQAudioParameters = function(buffer, maxVolume, audio) {
    this.updateBufferParameters(buffer, maxVolume, audio);
  };

  AudioManager.updateQAudioDistance = function(buffer) {
    var x1 = $gamePlayer.x;
    var y1 = $gamePlayer.y;
    var x2 = buffer.mapX;
    var y2 = buffer.mapY;
    var radius  = buffer.radius;
    var radian = Math.atan2(y2 - y1, x2 - x1);
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var volume = Math.max((radius - dist) / radius, 0);
    volume *= buffer.maxVolume * (this._bgmVolume / 100);
    buffer.volume = volume;
    var pan = Math.cos(radian);
    if (x2 === x1 && y2 === y1) {
      pan = 0;
    }
    buffer.pan = pan;
  };

  AudioManager.updateQAudio = function() {
    this._QAudioBuffers.forEach(function(buffer) {
      this.updateQAudioDistance(buffer);
    }, this);
  };

  AudioManager.stopAllQAudio = function() {
    this._QAudioBuffers.forEach(function(buffer) {
      buffer.stop();
    });
    this._QAudioBuffers = [];
  };

  var Alias_AudioManager_stopAll = AudioManager.stopAll;
  AudioManager.stopAll = function() {
    Alias_AudioManager_stopAll.call(this);
    this.stopAllQAudio();
  };

  //-----------------------------------------------------------------------------
  // Scene_Map
  //
  // The scene class of the map screen.

  var Alias_Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    Alias_Scene_Map_update.call(this);
    AudioManager.updateQAudio();
  };

  var Alias_Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    AudioManager.stopAllQAudio();
    Alias_Game_Map_setup.call(this, mapId);
  };
}());
