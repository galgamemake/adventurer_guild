//=============================================================================
// Sonaru Plugins - Tileset Change Manager
// SNR_TilesetChangeManager.js
//=============================================================================

/*:
 * @plugindesc Tileset Change Manager
 * @author Sonaru Isuge
 *
 * @help This plugin is for this project only.
 *
 * Only work when SNR_TilesetChangeManager.js is plugged.
 */


(function () {
    // var parameters = PluginManager.parameters('TilesetManager');

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'TilesetManager') {
            if (args[0] === 'Change') {
                $gameMap.changeMapData(Number(args[1]), Number(args[2]), Number(args[3]), Number(args[4]));
            }
        };
    }


    Game_Map.prototype.getMapData = function (x, y, z) {
        var pY = y * $dataMap.height;
        var pZ = z * ($dataMap.height * $dataMap.width);
        var pX = x;
        return $dataMap.data[(pY + pX + pZ)];
    };

    Game_Map.prototype.changeMapData = function (x, y, z, v) {
        var pY = y * $dataMap.height;
        var pZ = z * ($dataMap.height * $dataMap.width);
        var pX = x;
        $dataMap.data[pY + pX + pZ] = v;
        // this.refresh();
    };
})();

