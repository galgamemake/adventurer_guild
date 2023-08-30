//=============================================================================
// Quasi Params Plus
// Version: 1.15
// Last Update: August 4, 2016
//=============================================================================
// ** Terms of Use
// http://quasixi.com/terms-of-use/
// https://github.com/quasixi/RPG-Maker-MV/blob/master/README.md
//=============================================================================
// How to install:
//  - Save this file as "QuasiParamsPlus.js" in your js/plugins/ folder
//  - Add plugin through the plugin manager
//  - Open the Help menu for setup guide or visit one of the following:
//  - - http://forums.rpgmakerweb.com/index.php?/topic/48777-quasi-params-plus/
//=============================================================================

var Imported = Imported || {};
Imported.Quasi_ParamsPlus = 1.15;

//=============================================================================
 /*:
 * @plugindesc v1.15 Adds improvements to parameters
 * <QuasiParamsPlus>
 *
 * @author Quasi      Site: http://quasixi.com
 *
 * @param Use Custom Parameters
 * @desc If this is set to true, you will need a "Parameters.json" file inside
 * your data folder!     Set to true to enable, false to disable.
 * @default true
 *
 * @help
 * =============================================================================
 * ** Other
 * =============================================================================
 * In the formula set up for fixed params or rates formula. I added the extra
 * variable:
 *   current
 * which will be replaced by the current value of that parameter.
 * =============================================================================
 * ** Setting up Fixed Params
 * =============================================================================
 * Fixed Params allows you to add a fixed param value to states and equipment.
 * With this you can create states that will add a constant value to a param.
 * Or create a poison / regeneration state that ticks a fixed number.
 * ( You can also add these in Actors, Classes and Enemies Notes)
 *   Setting up <note tag>
 *       <params>
 *       Param: Value
 *       </params>
 *     Where Param can be: MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK and new Params
 *     Value can be any number or even a formula. Can use a and v[] but not b!
 *
 *   New Built in Parameters:
 *   (HRT) Hp Regeneration tick     - Works like Hp Regeneration (Ex-Parameter)
 *   (MRT) Mp Regeneration tick     - Works like Mp Regeneration (Ex-Parameter)
 *   (TRT) Tp Regeneration tick     - Works like Tp Regeneration (Ex-Parameter)
 *   (MCC) Mp Cost Constant         - Works like Mp Cost Rate (Sp-Parameter)
 *   (TCC) Tp Charge Constant       - Works like Tp Charge Rate (Sp-Parameter)
 *   (PDC) Physical Damage Constant - Works like Physical Damage (Sp-Parameter)
 *   (MDC) Magical Damage Constant  - Works like Magical Damage (Sp-Parameter)
 *   (FDC) Floor Damage Constant    - Works like Floor Damage (Sp-Parameter)
 *   (EXC) Experience Constant      - Works like Expericence (Sp-Parameter)
 * The difference is that these new stats are fixed values, not a percent.
 * =============================================================================
 * ** Converting Stats to Ex-Parameters or Sp-Parameters
 * =============================================================================
 * You can now convert X amount of points from a stat to a % of an Ex-Parameter!
 *   Setting up <note tag>
 *       <rates>
 *       X STAT to XPARAM
 *       </rates>
 *     Set X to the number, make X negative for a negative gain in the rate.
 *     STAT should be the abbreviations for any of the normal parameters +
 *     new parameters + custom parameters.
 *     XPARAM should be the abbreviation for an xparam or sparam
 *
 *   Abbreviations for xparams:
 *     hit, eva, cri, cev, mev, mrf, cnt, hrg, mrg, trg
 *
 *   Abbreviations for sparams:
 *     trg, grd, rec, pha, mcr, tcr, pdr, mdr, fdr, exr
 *
 *  With formula <note tag>
 *      <ratesFormula>
 *      XPARAM: value
 *      </ratesFormula>
 *    Set XPARAM to the abbreviation for a xparam or sparam
 *    Value can be any number or even a formula. Can use a and v[] but not b!
 * =============================================================================
 * ** Creating new Parameters
 * =============================================================================
 * To use custom parameters, you first have to enabled "Use Custom Parameters"
 * in the plugin settings. Next you need to create a json file inside the
 * data folder called "Parameters.json"
 *   If you do not know how to create a .json file download my sample
 *   Parameters.json file:
 *       https://gist.github.com/quasixi/3b928832bf42d4471560
 *
 *   JSON template <JSON>
 *       [
 *     	     {"abr": "abbreviation 1", "name": "param 1 name", "default": value},
 *     	     {"abr": "abbreviation 2", "name": "param 2 name", "default": value}
 *       ]
 *    (See the Example json file above!)
 *  Set abbreviation to the abbreviation you want to use for the new param.
 *   * Do not use any existing abbreviations ( Example: mhp, mmp, atk, ect..)
 *  Set param name to the full name of the parameter.
 *  Set default value to an number ( Can not use formulas here! )
 *   * Everything should be inside quotes except the value for default!
 *  Be careful with comma placement! Place a comma after every closing bracket }
 *  but not on the last one! ( Notice there's no comma after the } on line 65 )
 *    If you need helping setting these up, let me know or give me a list of
 *  the abbreviations, full name and default values, and I'll create it for
 *  you.
 * =============================================================================
 * ** Using new Parameters
 * =============================================================================
 * After you have created the new parameters you can use them the same way as
 * you use existing parameters.
 *     For example, lets say the abbreviation of a parameter I made was "qpp"
 *   If I want to get the value of qpp for my player I would use:
 *       $gameParty.members()[MEMBER ID].qpp
 *     (There are other ways to get an actors stat besides this!)
 *   Or if you want to use these parameters inside a forumla you would do:
 *       a.qpp    or    b.qpp
 *   These new parameters can be used inside the fixed params note tag!
 *
 *   To Change a custom Parameter use <Script Call>
 *       $gameParty.members()[MEMBER ID].addCParam(CParamId, value)
 *     * CParamId is the id of the custom parameter. which is based on
 *     the order the custom param was made. So in my example since param qpp
 *     was made first that would have an id of 0, while qpt has an id of 1.
 *     * Value can be a negative number.
 *
 *   To Set a custom Parameter use <Script Call>
 *       $gameParty.members()[MEMBER ID].setCParam(CParamId, value)
 *     * CParamId is the id of the custom parameter. which is based on
 *     the order the custom param was made. So in my example since param qpp
 *     was made first that would have an id of 0, while qpt has an id of 1.
 *     * Value is the number you want to set the parameter too.
 *
 *   These new functions can be used to get data from the new custom parameters
 *       QuasiParams.customAbr(ID)
 *       QuasiParams.customName(ID)
 *       QuasiParams.customMin(ID)
 *       QuasiParams.customMax(ID)
 *     Set ID to the id of the custom parameter.
 * =============================================================================
 * ** Examples:
 * =============================================================================
 *   Example 1:
 *       <params>
 *       MHP: 100
 *       ATK: 20
 *       </params>
 *     Would result in that state adding 100 to max hp and 20 to attack.
 *
 *   Example 2:
 *       <params>
 *       MHP: -100
 *       MRT: 5 + v[1]
 *       </params>
 *     Would result in that state removes 100 hp but you will have an mp regen
 *     of 5 + value of variable 1
 *
 *   Example of Stat to rate:
 *      <rates>
 *      5 agi to cri
 *      5 agi to hit
 *      </rates>
 *    For every 5 agi you will gain 1% of critical and hit rate.
 *    (Can only be used inside Actors, Classes and Enemy notes!)
 *
 *   Example of a rate formula:
 *     <ratesFormula>
 *     cri: (a.agi / 5) / 100
 *     </ratesFormula>
 *   This will add "(a.agi / 5) / 100" to cri.
 *   * Xparams and Sparams are percentages meaning, they're usually between
 *    0.00 to 1.00, 0 being 0% and 1.00 being 100%, which is why there is a / 100
 *    in my example.
 *    (Can only be used inside Actors, Classes and Enemy notes!)
 *
 *  * value can be negative
 *  * params is not case sensative
 * =============================================================================
 *  * Links
 *  - http://forums.rpgmakerweb.com/index.php?/topic/48777-quasi-params-plus/
 */
//=============================================================================

var QuasiParams = {};
(function() {
  var _plugin = $plugins.filter(function(p) { return p.description.contains('<QuasiParamsPlus>') && p.status; })[0].parameters;

  QuasiParams._id = {
    "mhp": 0,  "mmp": 1,  "atk": 2,  "def": 3,
    "mat": 4,  "mdf": 5,  "agi": 6,  "luk": 7,
    "hrt": 8,  "mrt": 9,  "trt": 10, "mcc": 11,
    "tcc": 12, "pdc": 13, "mdc": 14, "fdc": 15,
    "exc": 16
  };
  QuasiParams._xid = {
    "hit": 0, "eva": 1, "cri": 2, "cev": 3,
    "mev": 4, "mrf": 5, "cnt": 6, "hrg": 7,
    "mrg": 8, "trg": 9
  };
  QuasiParams._sid = {
    "trg": 0, "grd": 1, "rec": 2, "pha": 3,
    "mcr": 4, "tcr": 5, "pdr": 6, "mdr": 7,
    "fdr": 8, "exr": 9
  };

   QuasiParams._states = {};
   QuasiParams.stateParamsPlus = function(stateId) {
    if (!this._states[stateId]) {
      var params = /<params>([\s\S]*)<\/params>/i.exec($dataStates[stateId].note);
      this._states[stateId] = params ? this.stringToObjAry(params[1]) :  0;
    }
    return this._states[stateId];
  };

   QuasiParams._equips = [];
   QuasiParams._equips[0] = {}; // weapons
   QuasiParams._equips[1] = {}; // armors
   QuasiParams.equipParamsPlus = function(equip) {
    var data = !equip.atypeId ? this._equips[0] : this._equips[1];
    var id   = equip.baseItemId || equip.id;
    if (!data[id]) {
      var dataBase = !equip.atypeId ? $dataWeapons : $dataArmors;
      var note     = equip.note || dataBase[id].note;
      var params   = /<params>([\s\S]*)<\/params>/i.exec(note);
      data[id]     = params ? this.stringToObjAry(params[1]) : data[id] || {};
    }
    return data[id];
  };

  QuasiParams._items = [];
  QuasiParams.itemParamsPlus = function(item) {
    var data = this._items;
    var id   = item.baseItemId || item.id;
    if (!data[id]) {
      var note = $dataItems[id].note;
      var params = /<params>([\s\S]*)<\/params>/i.exec(note);
      data[id]     = params ? this.stringToObjAry(params[1]) : data[id] || {};
    }
    return data[id];
  };

   QuasiParams._charas = [];
   QuasiParams._charas[0] = {}; // actors
   QuasiParams._charas[1] = {}; // classes
   QuasiParams._charas[2] = {}; // enemies
   QuasiParams.charaParamsPlus = function(charaId, type) {
    if (type === "actor") {
      var data = this._charas[0];
      var note = $dataActors[charaId].note;
    } else if (type === "class") {
      var data = this._charas[1];
      var note = $dataClasses[charaId].note;
    } else if (type === "enemy") {
      var data = this._charas[2];
      var note = $dataEnemies[charaId].note;
    }
    if (!data[charaId]) {
      var params = /<params>([\s\S]*)<\/params>/i.exec(note);
      data[charaId] = params ? this.stringToObjAry(params[1]) : 0;
    }
    return data[charaId];
  };

   QuasiParams._rates = {xParam: {}, sParam: {}};
   QuasiParams._rates["xParam"][0] = {}; // actors
   QuasiParams._rates["sParam"][0] = {}; // actors
   QuasiParams._rates["xParam"][1] = {}; // classes
   QuasiParams._rates["sParam"][1] = {}; // classes
   QuasiParams._rates["xParam"][2] = {}; // enemies
   QuasiParams._rates["sParam"][2] = {}; // enemies
   QuasiParams.rateParamsPlus = function(charaId, type, pType) {
    if (type === "actor") {
      var data = this._rates[pType][0];
      var note = $dataActors[charaId].note;
    } else if (type === "class") {
      var data = this._rates[pType][1];
      var note = $dataClasses[charaId].note;
    } else if (type === "enemy") {
      var data = this._rates[pType][2];
      var note = $dataEnemies[charaId].note;
    }
    if (!data[charaId]) {
      data[charaId] = {};
      var rates1 = /<rates>([\s\S]*)<\/rates>/i.exec(note);
      var rates2 = /<ratesFormula>([\s\S]*)<\/ratesFormula>/i.exec(note);
      if (rates1) {
        data[charaId] = this.stringToRateAry(rates1[1], pType);
      }
      if (rates2) {
        data[charaId] = this.stringToRateObj(rates2[1], pType);
      }
    }
    return data[charaId];
  };

   QuasiParams._custom = [];
   QuasiParams.useCustom = _plugin['Use Custom Parameters'].toLowerCase() === 'true';
   QuasiParams.loadCustomParams = function() {
    if (this.useCustom) {
      var xhr = new XMLHttpRequest();
      var url = 'data/Parameters.json';
      xhr.open('GET', url, true);
      xhr.overrideMimeType('application/json');
      xhr.onload = function() {
        if (xhr.status < 400) {
          QuasiParams._custom = JSON.parse(xhr.responseText);
        }
      };
      xhr.send();
    }
  };
  QuasiParams.loadCustomParams();

  QuasiParams._customAbr = function(id) {
    return QuasiParams._custom[id].abr;
  };

  QuasiParams._customName = function(id) {
    return QuasiParams._custom[id].name;
  };

  QuasiParams._customMax = function(id) {
    return QuasiParams._custom[id].max;
  };

  QuasiParams._customMin = function(id) {
    return QuasiParams._custom[id].min;
  };

  QuasiParams.stringToObjAry = function(string) {
    var ary = string.split('\n');
    var obj = {};
    ary = ary.filter(function(i) { return i != ""; });
    ary.forEach(function(e) {
      var s = /^(.*):(.*)/.exec(e);
      if (s) {
        var id = QuasiParams._id[s[1].toLowerCase()];
        if (typeof id === 'undefined') {
          var p = s[1].toLowerCase();
          for (var i = 0; i < QuasiParams._custom.length; i++) {
            if (QuasiParams._custom[i]["abr"] === p) break;
          }
          id = 17 + i;
        }
        obj[id] = s[2];
      }
    });
    return obj;
  };

  QuasiParams.stringToRateAry = function(string, pType) {
    var ary = string.split('\n');
    var obj = {};
    ary = ary.filter(function(i) { return i != ""; });
    ary.forEach(function(e) {
      var s = /(-?[0-9]*)(.*)to(.*)/.exec(e);
      if (s) {
        s = s.map(function(i) { return i.replace(/\s+/g,'')});
        if (pType === "xParam") {
          var id = QuasiParams._xid[s[3].toLowerCase()];
        } else {
          var id = QuasiParams._sid[s[3].toLowerCase()];
        }
        var stat  = s[2].toLowerCase();
        var value = Number(s[1] || 1);
        obj[id] = "(a."+ stat + "/ " + value + ") / 100";
      }
    });
    return obj;
  };

  QuasiParams.stringToRateObj = function(string, pType) {
    var ary = string.split('\n');
    var obj = {};
    ary = ary.filter(function(i) { return i != ""; });
    ary.forEach(function(e) {
      var s = /^(.*):(.*)/.exec(e);
      if (s) {
        if (pType === "xParam") {
          var id = QuasiParams._xid[s[1].toLowerCase()];
        } else {
          var id = QuasiParams._sid[s[1].toLowerCase()];
        }
        obj[id] = s[2];
      }
    });
    return obj;
  };

  //-----------------------------------------------------------------------------
  // Game_BattlerBase
  //
  // The superclass of Game_Battler. It mainly contains parameters calculation.

  Object.defineProperties(Game_BattlerBase.prototype, {
    // Hp Regeneration tick
    hrt: { get: function() { return this.qParam(0); }, configurable: true },
    // Mp Regeneration tick
    mrt: { get: function() { return this.qParam(1); }, configurable: true },
    // Tp Regeneration tick
    trt: { get: function() { return this.qParam(2); }, configurable: true },
    // Mp Cost Constant
    mcc: { get: function() { return this.qParam(3); }, configurable: true },
    // Tp Charge Constant
    tcc: { get: function() { return this.qParam(4); }, configurable: true },
    // Physical Damage Constant
    pdc: { get: function() { return this.qParam(5); }, configurable: true },
    // Magical Damage Constant
    mdc: { get: function() { return this.qParam(6); }, configurable: true },
    // Floor Damage Constant
    fdc: { get: function() { return this.qParam(7); }, configurable: true },
    // EXperience Constant
    exc: { get: function() { return this.qParam(8); }, configurable: true }
  });

  var Alias_Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
  Game_BattlerBase.prototype.initMembers = function() {
    Alias_Game_BattlerBase_initMembers.call(this);
    this._cParamPlus = {};
    QuasiParams._custom.forEach(function(param, index) {
      this._cParamPlus[index] = QuasiParams._custom[index].default;
    }, this);
    if (!QuasiParams._addedCustoms) {
      QuasiParams._custom.forEach(function(param, index) {
        if (param["abr"] in this) {
          alert("Can not use the abbreviation " + param["abr"] + ". It already exists.");
        } else {
          var newProperty = {};
          newProperty[param["abr"]] = { get: function() {return this.cParam(index); }, configurable: true }
          Object.defineProperties(Game_BattlerBase.prototype, newProperty);
        }
      }, this);
      QuasiParams._addedCustoms = true;
    }
  };

  var Alias_Game_BattlerBase_param = Game_BattlerBase.prototype.param;
  Game_BattlerBase.prototype.param = function(paramId) {
    var value = Alias_Game_BattlerBase_param.call(this, paramId);
    var currentValue = value;
    value += this.stateParamPlus(paramId, currentValue);
    value += this.equipParamPlus(paramId, currentValue);
    value += this.getCharaParamPlus(paramId, currentValue);
    var maxValue = this.paramMax(paramId);
    var minValue = this.paramMin(paramId);
    var finalValue = Math.round(value.clamp(minValue, maxValue));
    return finalValue;
  };

  var Alias_Game_BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
  Game_BattlerBase.prototype.xparam = function(xparamId) {
    var value = Alias_Game_BattlerBase_xparam.call(this, xparamId);
    value += this.getRateParamPlus(xparamId, "xParam");
    return value;
  };

  var Alias_Game_BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
  Game_BattlerBase.prototype.sparam = function(sparamId) {
    var value = Alias_Game_BattlerBase_sparam.call(this, sparamId);
    value += this.getRateParamPlus(sparamId, "sParam");
    return value;
  };

  Game_BattlerBase.prototype.evalParamFormula = function(string, currentValue) {
    var v = $gameVariables._data;
    var a = this;
    var formula = string.replace("current", currentValue || 0);
    return eval(formula);
  };

  Game_BattlerBase.prototype.stateParamPlus = function(paramId, currentValue) {
    var value = 0;
    var states = this.states();
    for (var i = 0; i < states.length; i++) {
      var params = QuasiParams.stateParamsPlus(states[i].id);
      if (params[paramId]) {
        value += this.evalParamFormula(params[paramId], currentValue);
      }
    }
    return Number(value) || 0;
  };

  Game_BattlerBase.prototype.equipParamPlus = function(paramId, currentValue) {
    return 0;
  };

  Game_BattlerBase.prototype.getCharaParamPlus = function(paramId, currentValue) {
    var value = 0;
    if (this.isActor()) {
      value += this.charaParamPlus(paramId, this.actorId(), "actor", currentValue);
      value += this.charaParamPlus(paramId, this._classId, "class", currentValue);
    } else if (this.isEnemy()) {
      value += this.charaParamPlus(paramId, this.enemyId(), "enemy", currentValue);
      // if plugin for enemy class, then add enemy classes params here.
    }
    return Number(value) || 0;
  };

  Game_BattlerBase.prototype.charaParamPlus = function(paramId, charaId, type, currentValue) {
    if (type) {
      var value = 0;
      var params = QuasiParams.charaParamsPlus(charaId, type);
      if (params[paramId]) {
        value += this.evalParamFormula(params[paramId], currentValue);
      }
    }
    return Number(value) || 0;
  };

  Game_BattlerBase.prototype.getRateParamPlus = function(paramId, pType) {
    var value = 0;
    if (this.isActor()) {
      value += this.rateParamPlus(paramId, this.actorId(), "actor", pType);
      value += this.rateParamPlus(paramId, this._classId, "class", pType);
    } else if (this.isEnemy()) {
      value += this.rateParamPlus(paramId, this.enemyId(), "enemy", pType);
      // if plugin for enemy class, then add enemy classes params here.
    }
    return Number(value) || 0;
  };

  Game_BattlerBase.prototype.rateParamPlus = function(paramId, charaId, type, pType) {
    if (type) {
      var value = 0;
      var params = QuasiParams.rateParamsPlus(charaId, type, pType);
      if (params[paramId]) {
        var a = this;
        value += eval(params[paramId]);
      }
    }
    return Number(value) || 0;
  };

  Game_BattlerBase.prototype.qParam = function(qParamId) {
    var currentValue = 0;
    if (qParamId > 8) currentValue = this._cParamPlus[qParamId - 9];
    var value = this.stateParamPlus(qParamId + 8, currentValue);
    value += this.equipParamPlus(qParamId + 8, currentValue);
    value += this.getCharaParamPlus(qParamId + 8, currentValue);
    value += currentValue;
    return value || 0;
  };

  Game_BattlerBase.prototype.cParam = function(cParamId) {
    var value = this.qParam(cParamId + 9);
    var min   = typeof QuasiParams._customMin(cParamId) === 'number' ? QuasiParams._customMin(cParamId) : value;
    var max   = typeof QuasiParams._customMax(cParamId) === 'number' ? QuasiParams._customMax(cParamId) : value;
    return value.clamp(min, max);;
  };

  Game_BattlerBase.prototype.addCParam = function(paramId, value) {
    if (!this._cParamPlus[paramId]) this._cParamPlus[paramId] = 0;
    this._cParamPlus[paramId] += value;
    this.refresh();
  };

  Game_BattlerBase.prototype.setCParam = function(paramId, value) {
    this._cParamPlus[paramId] = value;
    this.refresh();
  };

  var Alias_Game_BattlerBase_skillMpCost = Game_BattlerBase.prototype.skillMpCost;
  Game_BattlerBase.prototype.skillMpCost = function(skill) {
    var value = Alias_Game_BattlerBase_skillMpCost.call(this, skill);
    return Math.floor(value + this.mcc);
  };

  //-----------------------------------------------------------------------------
  // Game_Battler
  //
  // The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
  // and actions.

  Game_Battler.prototype.regenerateHp = function() {
    var value = Math.floor(this.mhp * this.hrg + this.hrt);
    value = Math.max(value, -this.maxSlipDamage());
    if (value !== 0) this.gainHp(value);
  };

  Game_Battler.prototype.regenerateMp = function() {
    var value = Math.floor(this.mmp * this.mrg + this.mrt);
    if (value !== 0) this.gainMp(value);
  };

  Game_Battler.prototype.regenerateTp = function() {
    var value = Math.floor(100 * this.trg + this.trt);
    this.gainSilentTp(value);
  };

  Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
    var value = Math.floor(50 * damageRate * this.tcr + this.tcc);
    this.gainSilentTp(value);
  };

  //-----------------------------------------------------------------------------
  // Game_Actor
  //
  // The game object class for an actor.

  Game_Actor.prototype.equipParamPlus = function(paramId, currentValue) {
    var value = 0;
    var equips = this.equips();
    equips.forEach(function(equip) {
      if (equip) {
        var params = QuasiParams.equipParamsPlus(equip);
        if (params[paramId]) {
          value += this.evalParamFormula(params[paramId], currentValue);
        }
      }
    }, this);
    return Number(value || 0);
  };

  var Alias_Game_Actor_basicFloorDamage = Game_Actor.prototype.basicFloorDamage;
  Game_Actor.prototype.basicFloorDamage = function() {
    var value = Alias_Game_Actor_basicFloorDamage.call(this);
    return value + this.fdc;
  };

  var Alias_Game_Actor_finalExpRate = Game_Actor.prototype.finalExpRate;
  Game_Actor.prototype.finalExpRate = function() {
    var value = Alias_Game_Actor_finalExpRate.call(this);
    return value + this.exc;
  };

  //-----------------------------------------------------------------------------
  // Game_Action
  //
  // The game object class for a battle action.

  if (Imported.YEP_DamageCore) {
    Game_Action.prototype.applyPhysicalRate = function(value, baseDamage, target) {
      value *= target.pdr;
      return value + target.pdc;
    };
    Game_Action.prototype.applyMagicalRate = function(value, baseDamage, target) {
      value *= target.mdr;
      return value + target.mdc;
    };
  } else {
    var Alias_Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
      if (Imported.YEP_DamageCore) {
        return Alias_Game_Action_makeDamageValue.call(this, target, critical);
      }
      var item = this.item();
      var baseValue = this.evalDamageFormula(target);
      var value = baseValue * this.calcElementRate(target);
      if (this.isPhysical()) {
        value *= target.pdr;
        value += target.pdc;
      }
      if (this.isMagical()) {
        value *= target.mdr;
        value += target.mdc;
      }
      if (baseValue < 0) value *= target.rec;
      if (critical) value = this.applyCritical(value);
      value = this.applyVariance(value, item.damage.variance);
      value = this.applyGuard(value, target);
      value = Math.round(value);
      return value;
    };
  };

  var Alias_Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
  Game_Action.prototype.applyItemUserEffect = function(target) {
    Alias_Game_Action_applyItemUserEffect.call(this, target);
    var value = Math.floor(this.subject().tcc);
    this.subject().gainSilentTp(value);
    if (DataManager.isItem(this.item())) {
      var obj = QuasiParams.itemParamsPlus(this.item());
      for (var param in obj) {
        if (!obj.hasOwnProperty(param)) continue;
        var string = obj[param];
        if (param < 8) {
          var value = this.subject().evalParamFormula(string, this.subject().param(param));
          this.subject().addParam(param, value);
        } else if (param > 16) {
          var value = this.subject().evalParamFormula(string, this.subject().qParam(param));
          this.subject().addCParam(param - 17, value);
        }
      }
    }
  };

  Game_Action.prototype.itemHit = function(target) {
    if (this.isPhysical()) {
      return this.successRate(target) * this.subject().hit;
    } else {
      return this.successRate(target);
    }
  };

  Game_Action.prototype.successRate = function(target) {
    var rate;
    if (this.item().meta.success) {
      var a = this.subject();
      var b = target;
      var v = $gameVariables._data;
      rate = eval(this.item().meta.success);
    } else {
      rate = this.item().successRate / 100;
    }
    return rate;
  };
})();
