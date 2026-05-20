_WebForms.prototype.CreateInputIP = function (id, val) {
  var res = $("<fieldset id='" + id + "' class='input-ip'/>");
  res.data("value", val);
  val = val ? val.split('.') : ["", "", "", ""];

  for (var i = 0; i < 4; i++) {
    res.append($("<input type='text' placeholder='0' value='" + val[i] + "'/>" + ((i < 3) ? "<span>.</span>" : "")));
    res.data("field-" + i, val[i]);
  }
  $("input", res)
    .mouseup(function () { $(this).select(); })
    .keydown(function (e) {
      var len = $(this).val().length;
      var prev = $(this).prev().prev();
      if (!len && e.keyCode == 8 && prev.length) {
        prev.focus();
        e.preventDefault();
        e.stopPropagation();
      }
    })
    .keyup(function (e) {
      if (Number($(this).val()) > 255) {
        $(this).val($(this).data("prevValue"));
        $(this).select();
        e.preventDefault();
      }
    })
    .keypress(function (e) {
      var len = $(this).val().length;
      var next = $(this).next().next();
      $(this).data("prevValue", $(this).val());

      if (e.keyCode == 46 && next.length) {
        e.preventDefault();
        next.focus();
        return;
      }

      // Allow special keys
      if (e.keyCode < 32)
        return;

      // Not a numeric key
      if (!(e.keyCode >= 48 && e.keyCode <= 57)) {
        e.preventDefault();
        return;
      }

      // Limit length
      if (len >= 3)
        $(this).val("");
    })
    .change(function () {
      var o = $(this).index() / 2;
      var fs = $(this).closest("fieldset");
      fs.data("field-" + o, $(this).val());
      fs.data("value", (fs.data("field-0") | 0) + ("." + (fs.data("field-1") | 0)) + ("." + (fs.data("field-2") | 0)) + ("." + (fs.data("field-3") | 0)));
    });

  return res;
}

_WebForms.prototype.CreateInputTime = function (id, val) {
  var res = $("<fieldset id='" + id + "' class='input-time'/>");
  res.data("value", val);
  val = val ? val.split(':') : ["", ""];
  res.data("field-0", val[0]);
  res.data("field-1", val[1]);

  res
    .append($("<input type='text' placeholder='00' value='" + val[0] + "'/><span>:</span>"))
    .append($("<input type='text' placeholder='00' value='" + val[1] + "'/>"))

  $("input", res)
    .mouseup(function () { $(this).select(); })
    .keydown(function (e) {
      var len = $(this).val().length;
      var prev = $(this).prev().prev();
      if (!len && e.keyCode == 8 && prev.length) {
        prev.focus();
        e.preventDefault();
        e.stopPropagation();
      }
    })
    .keyup(function (e) {
      if (Number($(this).val()) > 59) {
        $(this).val($(this).data("prevValue"));
        $(this).select();
        e.preventDefault();
      }
    })
    .keypress(function (e) {
      var len = $(this).val().length;
      var next = $(this).next().next();
      $(this).data("prevValue", $(this).val());

      if (e.keyCode == 58 && next.length) {
        next.focus();
        e.preventDefault();
        return;
      }

      // Allow special keys
      if (e.keyCode < 32)
        return;

      // Not a numeric key
      if (!(e.keyCode >= 48 && e.keyCode <= 57)) {
        e.preventDefault();
        return;
      }

      // Limit length
      if (len >= 2)
        $(this).val("");
    })
    .change(function () {
      var o = $(this).index() / 2;
      var fs = $(this).closest("fieldset");
      fs
        .data("field-" + o, $(this).val())
        .data("value", (fs.data("field-0") | 0) + ":" + (fs.data("field-1") | 0));
    });

  return res;
}

_WebForms.prototype.CreateInputKeyboard = function (id, map, cols, callback) {
  var res = $("<div id='" + id + "' class='input-keypad'/>");
  var table = $("<table/>");
  res.append(table);
  var tr;
  for (var iRow = 0; iRow < map.length / cols; iRow++) {
    tr = $("<tr/>");
    table.append(tr);
    for (var iCol = 0; iCol < cols; iCol++) {
      var c = map[iRow * cols + iCol];
      var td = $("<td/>");
      tr.append(td);
      if (c) {
        var btn = $("<button/>");
        btn
          .text(c)
          .click($.proxy(callback, btn, btn.text()));
        td.append(btn);
      }
    }
  }

  return res;
}
/* 
  WebForms Studio 2.0 Framework 
  With RTU API
*/

window.console = window.console || (function () {
  var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function () { };
  return c;
})();

function _WebForms() {

  //
  // Public members
  //
  this.ObjectTypes = [];
  this.ObjectClassRoot = function () { };
  this.Events = [];
  this.CustomReceive = null;
  this.CustomAjaxFile = null;
  this.TWAIdentificationTimeout = null;
  this.TWAFirstRetrievedTimeout = null;
  this.TWAPeriodicalRetrievedTimeout = null;
  this.Focused = null;
  this.RtuTimeZone = null;
  this.FirstLoad = false;
  this.Timers = [];
  this.ChronoIndices = [];
  
  /////////////////////////////////////////////////////////////////////////////

this.RegisterObjectType = function (TypeName, TypeClass, ExtendedData) {
  var typeData = {
    Name: TypeName,
    Class: TypeClass
  }

  // Merge the type data with extended data
  $.extend(true, typeData, ExtendedData);

  this.ObjectTypes.push(typeData);
};

/////////////////////////////////////////////////////////////////////////////

this.ExtendClassRoot = function (source) {
  $.extend(true, this.ObjectClassRoot.prototype, source);
}

/////////////////////////////////////////////////////////////////////////////

this.FindObjectType = function (TypeName) {
  for (var iType = 0; iType < this.ObjectTypes.length; iType++) {
    var type = this.ObjectTypes[iType];
    if (type.Name == TypeName) {
      return type;
    }
  }

  return type;
}

/////////////////////////////////////////////////////////////////////////////

this.CreateObject = function (TypeName) {
  var type = this.FindObjectType(TypeName);

  if (type) {
    var newObject = new type.Class();
    // Extend the object using the global object header
    var ptr = new this.ObjectClassRoot();
    if (type.Extends) {
      $.extend(true, ptr, new type.Extends);
    }
    // The object class overrides its parent classes
    $.extend(true, ptr, newObject);
    return ptr;
  }

  return null;
}

/////////////////////////////////////////////////////////////////////////////

this.CreateElement = function (n, Element) {
  var obj = WebForms.CreateObject($(Element).data("type"));

  if (!obj)
    return false;

  // Store the class instance into the HTML element
  $(Element).data("instance", obj);
  obj.Element = $(Element);

  if (obj.onRootCreate) obj.onRootCreate(Element);

  // Make the element class a global object
  window[obj.id] = obj;

  return true;
}

this.BuildObject = function (Config) {
  var obj = WebForms.CreateObject(Config.type);

  if (!obj)
    return null;

  // Create the element in the page
  obj.Element = $("<div id='" + Config.id + "' />");
  obj.Element
    .data("instance", obj)
    .attr("data-type", Config.type)
    ;

  obj.Config = Config;

  $("div:eq(0)").append(obj.Element);

  if (obj.onRootCreate) obj.onRootCreate(obj.Element, Config);

  window[obj.id] = obj;

  Config.instance = obj;

  return obj;
}

this.AddObject = function (Config) {

  if (!PageData.Objects)
    PageData.Objects = [];

  PageData.Objects.push(Config);
}

this.InitializeElement = function (n, Element) {

  if (!Element) {
    this.CreateElement(0, n);
    this.InitializeElement(0, n);
    return;
  }

  var obj = WFInstance(Element);

  if (obj.onCreate) obj.onCreate(Element);
}

this.GlobalizeElements = function () {

}

/////////////////////////////////////////////////////////////////////////////

this.PageReady = function (Callback) {
  $(document).on("pageready", Callback);
}
this.RegisterEvent = function (Element, Name, Handler, Context) {

  // Since MainObject is not a real object, events cannot be registered to it
  // However the OnLoad event should be registered to the document 'pageready' event.
  if (Element == "MainObject") {
    switch (Name) {
      case "OnLoad": $(document).on("pageready", Handler); break;
      case "OnTimeout": $(document).on("pagetimeout", Handler); break;
      case "OnBeforeUnload": $(window).on("beforeunload", Handler); break;
      case "OnReady": $(document).on("authdone", Handler); break;
    }
  }

  var Wrapper = undefined;

  // Fix standard event names
  switch (Name) {
    case "OnClick": Name = "click"; break;
    case "OnMouseOut": Name = "mouseleave"; break;
    case "OnMouseOver": Name = "mouseenter"; break;
    case "OnLoad": Name = "load"; break;
    case "OnReady": Name = "authdone"; break;
    case "OnChange": Name = "change"; break;
    case "OnMouseDown": Name = "mousedown"; break;
    case "OnMouseUp": Name = "mouseup"; break;
    case "OnKeyDown": Name = "keydown"; Wrapper = function (e) { $.proxy(Handler, this)(e, e.which); }; break;
    case "OnKeyUp": Name = "keyup"; Wrapper = function (e) { $.proxy(Handler, this)(e, e.which); }; break;
    case "OnKeyPress": Name = "keypress"; Wrapper = function (e) { $.proxy(Handler, this)(e, e.which); }; break;
  }

  // Events aren't directly applied to objects, because objects don't exist yet
  // Instead, we store events in a list that will later be dispatched to objects, once they exist
  this.Events.push({
    Element: "#" + Element,
    Name: Name,
    Handler: Wrapper || Handler,
    Context: Context,
  });
}

/////////////////////////////////////////////////////////////////////////////

this.ConvertEvents = function () {
  // Process the events list and assign each event to the appropriate element
  for (var iEvent = 0; iEvent < this.Events.length; iEvent++) {
    var event = this.Events[iEvent];
    var elem = $(event.Element);
    var p = elem.data("instance");
    if (p && p.onRegisterEvent) {
      // The element has its own register event method
      var Result = p.onRegisterEvent(event.Name, event.Handler, event.Context);
      if (Result == 2) event.Handler(event.Context, event.Name);
      else if (Result == 0) elem.on(event.Name, p, event.Handler); // Unhandled event, use generic method
    }
    else
      // Generic method
      elem.on(event.Name, p, event.Handler);
  }

  // Clear the array
  this.Events.length = 0;
}
this.UpdateVisibilityAndWl = function () {
  $("[data-type]").each(function () {
    var p = $(this).data("instance");

    // Show elements for which the user has a sufficient level, hide others
    if (WebForms.GetUserLevel() >= p.VisibilityLevel) p.Show();
    else p.Hide();

    if (p.onWriteEnable)
      p.onWriteEnable(WebForms.GetUserLevel() >= p.WriteLevel);

    // Show which elements are editable by updating their cursor
    if ($._data(this, "events").click && WebForms.GetUserLevel() >= p.WriteLevel)
      $(this).css("cursor", "pointer");
  });
}

/////////////////////////////////////////////////////////////////////////////

this.SetUserLevel = function (level) {
  PageData.Session.level = level;
  this.UpdateVisibilityAndWl();
}

/////////////////////////////////////////////////////////////////////////////

this.GetUserLevel = function () {
  return PageData.Session.level;
}


this.ShowError = function (text, time) {
  var ErrorBox = $("#ErrorBox");

  // Get the element on top of everything
  ErrorBox.parent().append(ErrorBox);

  ErrorBox
    .text(text)
    .show()
  ;

  // Reset any existing timer
  if (this.ErrorBoxTimer)
    clearTimeout(this.ErrorBoxTimer);

  // Hide the message after a defined period
  this.ErrorBoxTimer = setTimeout(function () {
    ErrorBox.fadeOut();
    WebForms.ErrorBoxTimer = null;
  }, time || 2000);
}
this.RegisterTimer = function (name, interval, enabled, handler) {
  var timer = new (function (name, interval, enabled, handler) {
    this.name = name;
    this.interval = interval;
    this.handler = handler;
    this.enabled = enabled == "yes";

    this.onTick = function () {
      if (this.enabled) {
        this.handler();
        if (this.enabled) // Check enabled again as handler may have disabled the timer
          setTimeout($.proxy(this.onTick, this), this.interval);
      }
    }

    this.Enable = function () { if (!this.enabled) { this.enabled = true; setTimeout($.proxy(this.onTick, this), this.interval); } }
    this.Disable = function () { this.enabled = false; }
    this.GetStatus = function () { return this.enabled; }
  })(name, interval, enabled, handler);

  WebForms.Timers.push(timer);

  window[name] = timer;
}

/////////////////////////////////////////////////////////////////////////////

this.ActivateTimers = function () {
  for (var t = 0; t < WebForms.Timers.length; t++) {
    var tmr = WebForms.Timers[t];
    if (tmr.enabled)
      setTimeout($.proxy(tmr.onTick, tmr), tmr.interval);
  }
}

/////////////////////////////////////////////////////////////////////////////

this.CreateTask = function (Task, Interval, Context, TaskEnd) {
  setTimeout($.proxy(WebForms._processTask, { task: Task, interval: Interval, end: TaskEnd, context: Context }), Interval);
}

/////////////////////////////////////////////////////////////////////////////

this._processTask = function () {
  if ($.proxy(this.task, this.context)())
    setTimeout($.proxy(WebForms._processTask, this), this.interval);
  else if (this.end)
    $.proxy(this.end, this.context)();
}

this.CheckTimeout = function () {
  PageData.InactiveTime++;

  if (PageData.InactiveTime >= PageData.PageTimeout) {
    $(document).trigger("pagetimeout");
    PageData.InactiveTime = 0;
  }
}
this.PrepareList = function (TargetList, Callback) {
  for (var i = 0; i < TargetList.length; i++) {
    var ListItem = TargetList[i];
    ListItem.Targets = new Array();

    if (ListItem.tag) {
      ListItem.TagObject = FindItem(PageData.Tags, "name", ListItem.tag);
      ListItem.TagIndex = ListItem.TagObject.id;
    }
  }
}

this.CreateLists = function () {

  // Prepare lists by allocating them a target table and
  // resolve any reference to tags
  this.PrepareList(PageData.Tags);
  this.PrepareList(PageData.Sampling);
  this.PrepareList(PageData.Chronologies);

  // Build the tag list for each period
  for (var iPeriod = 0; iPeriod < PageData.Periods.length; iPeriod++) {
    var Period = PageData.Periods[iPeriod];

    if (iPeriod == 0) {
      // Period 0 actually downloads everything
      Period.Tags = GetAllItems(PageData.Tags, "id");
      Period.Sampling = GetAllItems(PageData.Sampling, "osIndex");
      Period.Chrono = GetAllItems(PageData.Chronologies, "TagIndex");
    }
    else {
      // Download only data specified for that period
      Period.Tags = BuildList(Period.Indices, PageData.Tags, "id");
      Period.Sampling = BuildList(Period.SamplingIndices, PageData.Sampling, "osIndex");
      Period.Chrono = BuildList(Period.ChronoIndices, PageData.Chronologies, "TagIndex");
    }
  }

  if (PageData.Alarms) {
    PageData.Alarms.Targets = [];
    PageData.Alarms.Values = [];
  }
}

this.FillTargets = function () {
  //! Fill the targets lists

  // For each object that requires tags
  $("[data-tag]").each(function () {
    // Get the list of required tags
    var Tags = this.getAttribute("data-tag").split(";");
    WFInstance(this).Tags = Tags;
    for (var iTag = 0; iTag < Tags.length; iTag++)
      WebForms.AddTagTarget(Tags[iTag], WFInstance(this), iTag);
  });
}

this.AddTagTarget = function (TagName, Target) {
  var Tag = FindItem(PageData.Tags, "name", TagName);

  if (Tag != null && Tag.Targets.indexOf(Target) == -1)
    Tag.Targets.push(Target);
}

this.AddTagCallback = function (TagName, Callback) { this.AddTagTarget(TagName, { callback: Callback }); }
this.SetFormStyle = function (attribute, value) {
  $("div:first").css(attribute, value);

  return this;
}

/////////////////////////////////////////////////////////////////////////////

this.IsLocalNetwork = function () {
  return new RegExp("(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)")
    .exec(new RegExp(/((?:(?:0?\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:1\d{2}|2[0-4]\d|25[0-5]|0?\d{1,2}))/g)
    .exec(window.location.href)) != undefined;
}

/////////////////////////////////////////////////////////////////////////////

this.Goto = function (url) { document.location.href = url; }
this.BeginPeriodicRequests = function () {
  // Start all period timers
  for (var i = 0; i < PageData.Periods.length; i++) {
    var Period = PageData.Periods[i].Period;
    setTimeout($.proxy(WebForms.DownloadPeriod, WebForms, Period), Period * 1000);
  }
}

/////////////////////////////////////////////////////////////////////////////

this.RtuQuery = function (url, success, timeout, callOnError, param, param2, param3) {
  var rtu = GetHttpParams("rtu");
  url += (rtu != undefined) ? "?url=http://" + rtu + "/" : "";

  $.ajax(url, {
    context: url,
    success: success,
    timeout: timeout,
    error: function () {
      WebForms.ShowError("Request to RTU has failed, retrying...");
      // Retry in 1s
      setTimeout($.proxy(callOnError, WebForms, param, param2, param3), 1000);
    },
    contentType: 'application/json'
  });
}

function GetPeriod(Period) {
  for (var i = 0; i < PageData.Periods.length; i++) if (PageData.Periods[i].Period == Period) return PageData.Periods[i];
  return null;
}

function GetGlobalRange(Source, Indices) {
    
if (Indices == null)
    return null;
 
  var Last = -1;
  var First = 0;

  for (var i = 0; i < Indices.length; i++) {
    var _First = ((Source[Indices[i]].TimeLast || 0) / 1000) | 0;
    if ( _First > First )
      First = _First;
  }

  return [First, Last];
}

function GetRanges(Source, Indices) {

  if (Indices == null)
    return null;

  var Ranges = new Array();

  for (var i = 0; i < Indices.length; i++) {
    var First = ((Source[Indices[i]].TimeLast || 0) / 1000) | 0;
    var Last = -1;
    Ranges.push([First, Last]);
  }

  return Ranges;
}

function GetGlobalDepth(Period) {
  return Period == 0 ? WebForms.TWARecordsFist : WebForms.TWARecordsPeriodically;
}

function GetDepths(Source, Indices, Period) {
  var Depths = new Array();

  if (Indices == null) {
    for (var i = 0; i < Source.length; i++) {
      var Depth = Period == 0 ? WebForms.TWARecordsFist : WebForms.TWARecordsPeriodically;

      Depths.push(Depth);
    }
    return Depths;
  }

  for (var i = 0; i < Indices.length; i++) {
    var Depth = Period == 0 ? WebForms.TWARecordsFist : WebForms.TWARecordsPeriodically;

    Depths.push(Depth);
  }

  return Depths;
}

this.DownloadAlarms = function(Period) {
  var tl = GetPeriod(Period);
  var queries = [];
  
  queries.push({
      command: "GetAlarms",

      callback: WebForms.ProcessAlarms,
      perform: { pre: "preProcessAlarms", post: "postProcessAlarms" }
    });
    
  rtu.process(queries, function (data) {

  if (!data) {
      WebForms.ShowError("Station is not responding...", 5000);
      setTimeout($.proxy(WebForms.DownloadPeriod, WebForms, Period), 2000);
      return;
  }

  // Notify all objects that the update is complete
  $("[data-type]").each(function () {
    var p = $(this).data("instance");
    if (p.onUpdateComplete)
      p.onUpdateComplete();
    });

  }, { timeout: WebForms.TWAPeriodicalRetrievedTimeout, period: tl });    
}

this.DownloadPeriod = function (Period) {

  var tl = GetPeriod(Period);

  var queries = [];

  if (PageData.Alarms && (Period == PageData.Alarms.Period || Period == 0)) {
    queries.push({
      command: "GetAlarms",
      start: PageData.Alarms.Last,

      callback: WebForms.ProcessAlarms,
      perform: { pre: "preProcessAlarms", post: "postProcessAlarms" }
    });
  }

  if (tl.Tags.length)
    queries.push({
      command: "GetTags",
      tags: tl.Tags,

      callback: WebForms.ProcessTags,
      perform: { pre: "preProcessTags", post: "postProcessTags" }
    });

  if (tl.Sampling.length) {

    queries.push({
      command: "GetSamplingTables",
      tables: tl.Sampling,
      time: GetRanges(PageData.Sampling, tl.SamplingIndices),
      depth: GetDepths(PageData.Sampling, tl.SamplingIndices, Period),

      callback: WebForms.ProcessSampling,
      perform: { pre: "preProcessSamplingTables", post: "postProcessSamplingTables" }
    });
  }

  if(WebForms.IncludeAllChronologies == undefined  || WebForms.IncludeAllChronologies == "no") // Process GetChronologies
  {
    if (tl.Chrono.length)
      queries.push({
      command: "GetChronologies",
      tags: tl.Chrono,
      time: GetRanges(PageData.Chronologies, tl.ChronoIndices),
      depth: GetDepths(PageData.Chronologies, tl.ChronoIndices, Period),

      callback: WebForms.ProcessChronologies,
      perform: { pre: "preProcessChronologies", post: "postProcessChronologies" }
    });
  }
  else if(WebForms.IncludeAllChronologies != undefined && WebForms.IncludeAllChronologies == "yes") // Process ALL Chronologies
  {
    if (tl.Chrono.length)
      queries.push({
      command: "GetAllChronologies",
      time: GetGlobalRange(PageData.Chronologies, tl.ChronoIndices),
      depth: GetGlobalDepth(Period),
        
      callback: WebForms.ProcessAllChronologies,
      perform: { pre: "preProcessAllChronologies", post: "postProcessAllChronologies" }
    });
    
  }

  if (queries.length == 0) {
    // Nothing to do, but the page is ready.
    // This is required for pages without RTU queries, otherwise OnReady is never triggered.
    if(WebForms.FirstLoad) {
      $(document).trigger("authdone");
      WebForms.FirstLoad = false;
    }
    return;
  }

  rtu.process(queries, function (data) {

    if (!data) {
      WebForms.ShowError("Station is not responding...", 5000);
      setTimeout($.proxy(WebForms.DownloadPeriod, WebForms, Period), 2000);
      return;
    }

    // Notify all objects that the update is complete
    $("[data-type]").each(function () {
      var p = $(this).data("instance");
      if (p.onUpdateComplete)
        p.onUpdateComplete();
    });
    
    if(WebForms.FirstLoad) {
      $(document).trigger("authdone");
      WebForms.FirstLoad = false;
    }
    
    // Trigger next download
    if (Period > 0)
      setTimeout($.proxy(WebForms.DownloadPeriod, WebForms, Period), Period * 1000);

  }, { timeout: WebForms.TWAPeriodicalRetrievedTimeout, period: tl });
}

  /////////////////////////////////////////////////////////////////////////////
  
function UpdateAlarm(AlarmId, NewData) {
  for (var iAlarm = 0; iAlarm < PageData.Alarms.Values.length; iAlarm++) {
    if (PageData.Alarms.Values[iAlarm][1] == NewData[1])
      PageData.Alarms.Values[iAlarm] = NewData;
  }
}

this.ProcessAlarms = function (data, context) {

  PageData.Alarms.Last = data.last;

  if (data.alarms.length == 0)
    return;

  // Last alarm id
  var LastAlarm = PageData.Alarms.Values.length > 0 ? PageData.Alarms.Values[0][1] : -2;
 
  // Merge alarms
  for (var iAlarm = data.alarms.length - 1; iAlarm >= 0; iAlarm--) {
    var alarm = data.alarms[iAlarm];

    if (alarm[1] > LastAlarm) PageData.Alarms.Values.unshift(alarm); // New alarm
    else UpdateAlarm(alarm[1], alarm);                               // Existing alarm
  }

  PageData.Alarms.Values = (PageData.Alarms.Values > WebForms.TrimSize) ? PageData.Alarms.Values.slice(0, WebForms.TrimSize) : PageData.Alarms.Values;

  // Dispatch to targets
  for (var iTarget = 0; iTarget < PageData.Alarms.Targets.length; iTarget++)
    PageData.Alarms.Targets[iTarget].onHistoryUpdate("ALARMS", PageData.Alarms.Values, PageData.Alarms);
}

this.ProcessAllChronologies = function (data, context) {
    
  if (data.analogs.length == 0 && data.digitals.length == 0)
    return;

  for(var i = 0; i < WebForms.ChronoIndices.length; i++)
  {
    var Table = PageData.Chronologies[WebForms.ChronoIndices[i].IdxTable];
    if(Table != undefined)
    {
      Table.Values = MergeTable(Table.Values || [], CollectData(WebForms.ChronoIndices[i].TagIndex, data), WebForms.TrimSize);
      Table.TimeLast = (Table.Values.length > 0) ? Table.Values[0][0] : 0;
        
      // Dispatch to targets
      for (var iTarget = 0; iTarget < Table.Targets.length; iTarget++)
        Table.Targets[iTarget].onHistoryUpdate(Table.name, Table.Values, Table);
    }
  }
}

CollectData = function(TagIndex, data) 
{
  var Data = [];
  
  for (var iTableDigi = 0; iTableDigi < data.digitals.length; iTableDigi++)
  {
    if(TagIndex == data.digitals[iTableDigi][0])
    {
      // Remove Tag Handle
        var TagHandle = data.digitals[iTableDigi][0];
        const index = data.digitals[iTableDigi].indexOf(TagHandle);
        if (index > -1) {
          data.digitals[iTableDigi].splice(index, 1);
        }
        
        Data.push(data.digitals[iTableDigi]);
    }
  }
  
  for (var iTableAna = 0; iTableAna < data.analogs.length; iTableAna++) {
      
    if(TagIndex == data.analogs[iTableAna][0])
    {
        var TagHandle = data.analogs[iTableAna][0];
        const index = data.analogs[iTableAna].indexOf(TagHandle);
        if (index > -1) {
          data.analogs[iTableAna].splice(index, 1);
        }
        
       Data.push(data.analogs[iTableAna]);
    }
  }
  
  return Data;
}

this.ProcessChronologies = function (data, context) {

  if (data.tables.length == 0)
    return;

  for (var iTable = 0; iTable < data.tables.length; iTable++) {

    var TableIndex = (context.period.Period > 0) ? context.period.ChronoIndices[iTable] : iTable;
    var Table = PageData.Chronologies[TableIndex];

    Table.Values = MergeTable(Table.Values || [], data.tables[iTable], WebForms.TrimSize);
    Table.TimeLast = (Table.Values.length > 0) ? Table.Values[0][0] : 0;

    // Dispatch to targets
    for (var iTarget = 0; iTarget < Table.Targets.length; iTarget++)
      Table.Targets[iTarget].onHistoryUpdate(Table.name, Table.Values, Table);
  }

}
this.ProcessSampling = function (data, context) {

  if (data.tables.length == 0)
    return;

  for (var iTable = 0; iTable < data.tables.length; iTable++) {

    var TableIndex = (context.period.Period > 0) ? context.period.SamplingIndices[iTable] : iTable;
    var Table = PageData.Sampling[TableIndex];

    Table.Values = MergeTable(Table.Values || [], data.tables[iTable], WebForms.TrimSize);
    Table.TimeLast = (Table.Values.length > 0) ? Table.Values[0][0] : 0;

    // Dispatch to targets
    for (var iTarget = 0; iTarget < Table.Targets.length; iTarget++)
      Table.Targets[iTarget].onHistoryUpdate(Table.name, Table.Values, Table);
  }
}
this.ProcessTags = function (data, context) {

  // Dispatch each tag to its target objects
  
  for (var iTag = 0; iTag < context.period.Tags.length; iTag++) {

    // Find the correct tag in the page data table
    var TagObject = PageData.Tags[(context.period.Period > 0) ? context.period.Indices[iTag] : iTag];
    SetTagObjectValue(TagObject, data.tags[iTag]);
  }
}

}

var WebForms = new _WebForms();

WebForms.RegisterObjectType("Angle90", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Color = p.data("color");
    this.angle = p.data("angle");

    var svg = '<defs>';
    svg += '<radialGradient id="angle90gradient_' + this.id + '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">';
    svg += '<stop offset="50%" stop-color="' + this.Color + '" stop-opacity="1" />';
    svg += '<stop offset="75%" stop-color="#FFFFFF" stop-opacity="1" />';
    svg += '<stop offset="100%" stop-color="' + this.Color + '" stop-opacity="1" />';
    svg += '</radialGradient>';
    svg += '<clipPath id="angle90mask_' + this.id + '"><path d="M50,50 m0,-50 v25 a25,25 180 0,0 -25,25 h-25 m50,-50 a50,50 0 0,0 -50,50"/></clipPath>';
    svg += '</defs>';
    svg += '<circle cx="50" cy="50" r="50" fill="url(#angle90gradient_' + this.id + ')" clip-path="url(#angle90mask_' + this.id + ')" transform = "rotate(' + this.angle + ',25,25)"/>';

    this.AppendSVG(50, 50, svg, 1);
  }

  this.GetColor = function () { return this.Color; }
  this.SetColor = function (Color) { this.Color = Color; $("stop:eq(0),stop:eq(2)", this.Element).attr("stop-color", Color); }
});
WebForms.RegisterObjectType("Circle", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Restruct("colors", "Color1", "Color2", "BorderColor", "BorderSize");
    this.Radius = p.data("radius") + "%";
    this.Gradient = p.data("gradient");

    var svg = '';
    if (this.Gradient == "yes") {
      svg += '<defs>';
      svg += '<radialGradient id="circlegradient_' + this.id + '" cx="50%" cy="50%" r="' + this.Radius + '" fx="50%" fy="50%">';
      svg += '<stop offset="0%" stop-color="' + this.Color2 + '" stop-opacity="1"/>';
      svg += '<stop offset="100%" stop-color="' + this.Color1 + '" stop-opacity="1"/>';
      svg += '</radialGradient>';
      svg += '</defs>';
      svg += '<circle cx="50" cy="50" r="45" fill="url(#circlegradient_' + this.id + ')" stroke="' + this.BorderColor + '" stroke-width="' + this.BorderSize + '" />;';
    }
    else
      svg += '<circle cx="50" cy="50" r="45" fill="' + this.Color1 + '" stroke="' + this.BorderColor + '" stroke-width="' + this.BorderSize + '"/>';

    this.AppendSVG(100, 100, svg);
  }

  // User functions
  this.GetColor1 = function () { return this.Color1; }
  this.GetColor2 = function () { return this.Color2; }
  this.SetColor1 = function (Color) {
    this.Color1 = Color;
    if (this.Gradient == "yes") $("stop:eq(1)", this.Element).attr("stop-color", Color);
    else $("circle", this.Element).attr("fill", Color);
  }
  this.SetColor2 = function (Color) { this.Color2 = Color; $("stop:eq(0)", this.Element).attr("stop-color", Color); }
  this.SetBorderColor = function (Color) { this.BorderColor = Color; $("circle", this.Element).attr("stroke", Color); }
  this.GetBorderColor = function () { return this.BorderColor; }
  this.SetStrokeWidth = function (Size) { this.BorderSize = Size; $("circle", this.Element).attr("stroke-width", Size); }
  this.GetStrokeWidth = function () { return this.BorderSize; }
});
WebForms.RegisterObjectType("Line", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Color = p.data("color");
    this.Height = p.data("size");
    this.Length = p.data("length");
    this.Angle = Number(p.data("angle"));
    this.Origin = p.data("orig");

    this.Rebuild();
  }

  this.Rebuild = function () {
    var tr;
    if (this.Angle >= 180)
      tr = "translate(-1px,0px) ";
    else if (this.Angle > 0)
      tr = "translate(1px,0px) ";
    var svg = '<rect fill="' + this.Color + '" stroke-width="0px" x="0" y="0" width="' + this.Length + 'px" height="' + this.Height + 'px" />';
    var r = this.AppendSVG(0, 0, svg)
      .css("transform", tr + "rotate(" + this.Angle + "deg)")
      .css("transform-origin", "0px " + this.Origin + "px");
  }

  // User functions
  this.GetColor = function () { return this.Color; }
  this.SetColor = function (Color) { this.Color = Color; this.Rebuild(); }
  this.GetHeight = function () { return this.Height; }
  this.SetHeight = function (Height) { this.Height = Height; this.Rebuild(); }
  this.GetWidth = function () { return this.Length; }
  this.SetWidth = function (Width) { this.Length = Width; this.Rebuild(); }
  this.SetStrokeWidth = function (StrokeWidth) {
    this.Height = StrokeWidth;
    $(this.Element).css("height", StrokeWidth + "px");
    this.Rebuild();
  }
  this.GetStrokeWidth = function () { return this.Height; }
});
WebForms.RegisterObjectType("Nozzle", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Color = p.data("color");
    this.angle = p.data("angle");

    var svg = '<defs>';
    svg += '<linearGradient id="nozzle_' + this.id + '"  x1="0%" y1="0%"  x2="0%" y2="100%" >';
    svg += '<stop offset="0%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '<stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>';
    svg += '<stop offset="100%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '</linearGradient>';
    svg += '</defs>';
    svg += '<g transform="rotate(' + this.angle + ' 12.5 12.5)">';
    svg += '<g fill="url(#nozzle_' + this.id + ')">';
    svg += '<rect x="6.2" y="4" rx="0.3" ry="0.3" width="1.5" height="2"/>';
    svg += '<rect x="6.2" y="19" rx="0.3" ry="0.3" width="1.5" height="2"/>';
    svg += '<rect x="17.3" y="4" rx="0.3" ry="0.3" width="1.5" height="2"/>';
    svg += '<rect x="17.3" y="19" rx="0.3" ry="0.3" width="1.5" height="2"/>';
    svg += '</g>';
    svg += '<g fill="url(#nozzle_' + this.id + ')" style="stroke:black;stroke-width:0.1;">';
    svg += '<rect x="7.5" y="2" rx="1" ry="1" width="5" height="21"/>';
    svg += '<rect x="12.5" y="2" rx="1" ry="1" width="5" height="21"/>';
    svg += '</g>';
    svg += '</g>';

    this.AppendSVG(25, 25, svg);
  }

  // User functions
  this.GetColor = function () { return this.Color; }
  this.SetColor = function (Color) { this.Color = Color; $("stop:eq(0),stop:eq(2)", this.Element).attr("stop-color", Color); }
});
WebForms.RegisterObjectType("Pipe", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Color = p.data("color");
    this.angle = p.data("angle");

    var svg = '<defs>';
    svg += '<linearGradient id="pipegradient_' + this.id + '" x1="0%" y1="0%" ' + this.angle + '>';
    svg += '<stop offset="0%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '<stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>';
    svg += '<stop offset="100%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '</linearGradient>';
    svg += '</defs>';
    svg += '<rect id="pipe" x="0" y="0" width="100" height="30" fill="url(#pipegradient_' + this.id + ')" style="stroke:black;stroke-width:0.1;"/>';

    this.AppendSVG(100, 30, svg);
  }

  // User functions
  this.GetColor = function () { return this.Color; }
  this.SetColor = function (Color) { this.Color = Color; $("stop:eq(0),stop:eq(2)", this.Element).attr("stop-color", Color); }
});
WebForms.RegisterObjectType("Rectangle", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Restruct("colors", "Color1", "Color2", "Gradient", "Transparent");
    this.Restruct("border", "BorderSize", "BorderColor", "BorderRadius", "BorderStyle");

    this.ComputedBorderRadius = this.BorderRadius * this.Rect[2] / this.Rect[3] / 2;
    this.x = this.BorderSize;
    this.y = this.BorderSize;
    this.w = this.Rect[2] - this.BorderSize * 2;
    this.h = this.Rect[3] - this.BorderSize * 2;

    this.Transparent = this.Transparent == "yes" ? 0 : 1;

    var svg = '';
    if (this.Gradient == "No Gradient")
      svg += '<rect x="' + this.x + '" y="' + this.y + '" rx="' + this.BorderRadius + '" ry="' + this.ComputedBorderRadius + '" width="' + this.w + '" height="' + this.h + '" fill="' + this.Color1 + '" stroke="' + this.BorderColor + '" fill-opacity="' + this.Transparent + '" stroke-width="' + this.BorderSize + '"/>';
    else {
      svg += '<defs>';
      if (this.Gradient == "Vertical") { svg += '<linearGradient id="rectgradient_' + this.id + '" x1="0%" y1="0%" x2="0%" y2="100%">'; }
      else if (this.Gradient == "Horizontal") { svg += '<linearGradient id="rectgradient_' + this.id + '" x1="0%" y1="0%" x2="100%" y2="0%">'; }
      svg += '<stop offset="0%" stop-color="' + this.Color1 + '" stop-opacity="1"/>';
      svg += '<stop offset="50%" stop-color="' + this.Color2 + '" stop-opacity="1"/>';
      svg += '<stop offset="100%" stop-color="' + this.Color1 + '" stop-opacity="1"/>';
      svg += '</linearGradient>';
      svg += '</defs>';
      svg += '<rect x="' + this.x + '" y="' + this.y + '" rx="' + this.BorderRadius + '" ry="' + this.ComputedBorderRadius + '" width="' + this.w + '" height="' + this.h + '" fill="url(#rectgradient_' + this.id + ')" fill-opacity="' + this.Transparent + '" stroke="' + this.BorderColor + '" stroke-width="' + this.BorderSize + '"/>';
    }

    p.css("border-style", this.BorderStyle);
    this.AppendSVG(this.Rect[2], this.Rect[3], svg);
  }

  // User functions
  this.GetColor = function () { return this.Color1; }
  this.SetColor = function (Color) {
    this.Color1 = Color;
    if (this.Gradient == "No Gradient")
      $("rect", this.Element).attr("fill", Color);
    else {
      $("stop:eq(0)", this.Element).attr("stop-color", Color);
      $("stop:eq(2)", this.Element).attr("stop-color", Color);
    }
  }
  this.GetBorderColor = function () { return this.BorderColor; }
  this.SetBorderColor = function (Color) { this.BorderColor = Color; $("rect", this.Element).attr("stroke", Color); }
  this.SetStrokeWidth = function (Size) { this.BorderSize = Size; $("rect", this.Element).attr("stroke-width", Size); }
  this.GetStrokeWidth = function () { return this.BorderSize; }  
});
WebForms.RegisterObjectType("Separator", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Color = p.data("color");

    var svg = '<defs>';
    svg += '<linearGradient id="vertical_' + this.id + '" x1="0%" y1="0%"  x2="100%" y2="0%" >';
    svg += '<stop offset="0%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '<stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>';
    svg += '<stop offset="100%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '</linearGradient>';
    svg += '<linearGradient id="horizontal_' + this.id + '" x1="0%" y1="0%"  x2="0%" y2="100%" >';
    svg += '<stop offset="0%"   stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '<stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>';
    svg += '<stop offset="100%" stop-color="' + this.Color + '" stop-opacity="1"/>';
    svg += '</linearGradient>';
    svg += '<radialGradient id="angle90gradient_' + this.id + '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">';
    svg += '<stop offset="50%" stop-color="' + this.Color + '" stop-opacity="1" />';
    svg += '<stop offset="75%" stop-color="#FFFFFF" stop-opacity="1" />';
    svg += '<stop offset="100%" stop-color="' + this.Color + '" stop-opacity="1" />';
    svg += '</radialGradient>';
    svg += '<clipPath id="angle90mask_' + this.id + '">';
    svg += '<path d="M50,50 m0,-50 v25 a25,25 180 0,0 -25,25 h-25 m50,-50 a50,50 0 0,0 -50,50"/>';
    svg += '</clipPath>';
    svg += '<clipPath id="angle90mask_small_' + this.id + '">';
    svg += '<path d="M40,40 m0,-40 v20 a20,20 180 0,0 -20,20 h-20 m40,-40 a40,40 0 0,0 -40,40"/>';
    svg += '</clipPath>';
    svg += '</defs>';
    svg += '<circle cx="40" cy="40" r="40" fill="url(#angle90gradient_' + this.id + ')" clip-path="url(#angle90mask_small_' + this.id + ')" transform = "rotate(0,25,25) translate(113 5)" />';
    svg += '<circle cx="50" cy="50" r="50" fill="url(#angle90gradient_' + this.id + ')" clip-path="url(#angle90mask_' + this.id + ')" transform = "rotate(0,25,25) translate(37 90)" />';
    svg += '<rect x="37" y="139" width="25" height="62" fill="url(#vertical_' + this.id + ')" />';
    svg += '<circle cx="50" cy="50" r="50" fill="url(#angle90gradient_' + this.id + ')" clip-path="url(#angle90mask_' + this.id + ')" transform = "rotate(180,25,25) translate(-12 -200)" />';
    svg += '<rect x="3" y="217" rx="2" ry="2" width="10" height="40" stroke="black" stroke-width="0.5" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="150" y="0" rx="2" ry="2" width="7" height="30" stroke="black" stroke-width="0.5" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="75" y="300" width="90" height="10" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="180" y="180" width="30" height="16" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="180" y="235" width="30" height="16" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="210" y="173" rx="2" ry="2" width="7" height="30" stroke="black" stroke-width="0.5" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="210" y="227" rx="2" ry="2" width="7" height="30" stroke="black" stroke-width="0.5" fill="url(#horizontal_' + this.id + ')" />';
    svg += '<rect x="75" y="270" width="15" height="60" fill="url(#vertical_' + this.id + ')" />';
    svg += '<rect x="160" y="270" width="15" height="60" fill="url(#vertical_' + this.id + ')" />';
    svg += '<rect id="bottomrectangle" x="60" rx="5" ry="5" y="325" width="130" height="10" fill="' + this.Color + '" />';
    svg += '<rect x="70" y="45" rx="45" ry="45" width="110" height="250" stroke="black" stroke-width="0.6" fill="url(#vertical_' + this.id + ')" />';
    svg += '<rect x="105" y="36" rx="2" ry="2" width="40" height="10" stroke="black" stroke-width="0.5" fill="url(#vertical_' + this.id + ')" />';

    this.AppendSVG(230, 335, svg);
  }
});
WebForms.RegisterObjectType("Symbol", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    var vbox;
    var frm = "";

    switch (p.data("symbol")) {
      case "Compressor":
        vbox = "50 50";
        frm = '<path id="path" fill-opacity="0" stroke="' + this.BorderColor + '" stroke-width="2" d="M 1 1 L 1 49 L 49 40 L 49 10 z "/>';
        break;

      case "Separator":
        vbox = "63 81";
        frm += '<g fill-opacity="0" stroke="' + this.BorderColor + '" stroke-width="2">';
        frm += '<rect x="10" y="1" width="40" height="69"/>';
        frm += '<line stroke-width="0.8" x1="30" y1="1" x2="30" y2="70"/>';
        frm += '<rect x="1" y="70" width="60" height="10"/>';
        if (p.data("separator") == "3 Phases")
          frm += '<rect x="50" y="10" width="12" height="10"/>';
        frm += '</g>';
        break;

      case "Tree":
        vbox = "70 80";
        frm += '<g fill="' + p.data("color") + '" stroke="' + this.BorderColor + '" stroke-width="2">';
        frm += '<rect rx="2" ry="2" x="1" y="20" width="68" height="10"/>';
        frm += '<rect rx="2" ry="2" x="11" y="40" width="48" height="10"/>';
        frm += '<rect rx="2" ry="2" x="30" y="1" width="10" height="78"/>';
        frm += '<rect rx="1" ry="1" fill="' + this.BorderColor + '" x="22.5" y="64" width="25" height="15"/>';
        frm += '</g>';
        break;
    }

    p.append($('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vbox + '" preserveAspectRatio="none">' + frm + '</svg>'));
  }

  this.SetBorderColor = function (c) { this.BorderColor = c; }
});
WebForms.RegisterObjectType("Triangle", function () {
  this.onCreate = function (Element) {
    var p = $(Element);

    this.Restruct("colors", "Color1", "Color2", "Gradient");
    this.Restruct("border", "BorderSize", "BorderColor");
    this.angle = p.data("angle");

    var svg = '';
    if (this.Gradient == "no") {
      svg += '<path  d="M 5 5 L 5 95 L 95 50 z" fill="' + this.Color1 + '" stroke="' + this.BorderColor + '" stroke-width="' + this.BorderSize + '" transform="rotate(' + this.angle + ' 50 50)"/>';
    }
    else {
      svg += '<defs>';
      svg += '<linearGradient id="trianglegradient_' + this.id + '" x1="0%" y1="0%" x2="0%" y2="100%">';
      svg += '<stop offset="0%" stop-color="' + this.Color1 + '" stop-opacity="1"/>';
      svg += '<stop offset="50%" stop-color="' + this.Color2 + '" stop-opacity="1"/>';
      svg += '<stop offset="100%" stop-color="' + this.Color1 + '" stop-opacity="1"/>';
      svg += '</linearGradient>';
      svg += '</defs>';
      svg += '<path d="M 5 5 L 5 95 L 95 50 z" fill="url(#trianglegradient_' + this.id + ')" stroke="' + this.BorderColor + '" stroke-width="' + this.BorderSize + '" transform="rotate(' + this.angle + ' 50 50)"/>;';
    }

    this.AppendSVG(100, 100, svg);
  }

  // User functions
  this.GetColor1 = function () { return this.Color1; }
  this.GetColor2 = function () { return this.Color2; }
  this.SetColor1 = function (Color) {
    this.Color1 = Color;
    if (this.Gradient == "no")
      $("path", this.Element).attr("fill", Color);
    else {
      $("stop:eq(0)", this.Element).attr("stop-color", Color);
      $("stop:eq(2)", this.Element).attr("stop-color", Color);
    }
  }
  this.SetColor2 = function (Color) {
    this.Color2 = Color;
    $("stop:eq(1)", this.Element).attr("stop-color", Color);
  }
  this.SetStrokeWidth = function (Size) { this.BorderSize = Size; $("path", this.Element).attr("stroke-width", Size); }
  this.GetStrokeWidth = function () { return this.BorderSize; }  
});
WebForms.ShowCSV = function (tables, format, start, end, series) {
  if (!WebForms.csvViewer) {
    var dlg = new InputDialog("csvView", "CSV", 400, 270);
    WebForms.csvViewer = dlg;

    dlg
      .AddLabel(null, "From:", "lblFrom")
      .AddInput("Start date", "", "tbStart", null, "datetime-local")
      
      .AddLabel(null, "To:", "lblTo")
      .AddInput("End date", "", "tbEnd", null, "datetime-local")

      .AddLabel(null, "Tables:", "lblTables")
      .AddComboBox("comboList", 233, 100, true)

      .AddLabel(null, "Format:", "lblFormat")
      .AddInput("Format", "", "tbFormat", 27)
      .AddCheckbox("cbMs")
      .AddLabel(null, "Show Ms", "lblShowMs")

      .AddButton("Download", function () { dlg.Download(); }, null, "btnDownload")
      ;

    dlg.CloseOnEscape = true;
    dlg.onClose = dlg.Hide;

    dlg.Combo = dlg.GetItem("#comboList");
    dlg.Text = dlg.GetItem("#csv");
    dlg.CheckMs = dlg.GetItem("#cbMs");
    dlg.Format = dlg.GetElement("tbFormat");
    dlg.Start = dlg.GetElement("tbStart");
    dlg.End = dlg.GetElement("tbEnd");
    
    dlg
      .MoveElement("lblFrom", 8, 5)
      .MoveItem(dlg.Start, 80, 2)
      .MoveElement("lblTo", 8, 37)
      .MoveItem(dlg.End, 80, 34)
      .MoveElement("lblTables", 8, 68)
      .MoveItem(dlg.Combo, 80, 66)

      .MoveElement("lblFormat", 8, 174)
      .MoveItem(dlg.Format, 80, 172)
      .MoveItem(dlg.CheckMs, 310, 176)
      .MoveElement("lblShowMs", 326, 176)

      .MoveElement("btnDownload", 80, 210)
      ;

    dlg.CheckMs.change(function () {
      dlg.UpdateFormat();
    });

     dlg.FillList = function () {
      var combo = dlg.GetItem("#comboList");
      combo.empty();
      
      for (var iTable = 0; iTable < PageData.Sampling.length; iTable++) 
      { 
        var SerieName = undefined;  
        for(var j = 0; j < series.length; j++)
          if(series[j].split(',')[1] == PageData.Sampling[iTable].TagObject.name)
            SerieName = series[j].split(',')[0];
        
        var table = PageData.Sampling[iTable]; dlg.Combo.append($("<option/>").data("table", table).text(SerieName + " (" + table.tag + ")"));
      }
      
      for (var iTable = 0; iTable < PageData.Chronologies.length; iTable++) { var table = PageData.Chronologies[iTable]; dlg.Combo.append($("<option/>").data("table", table).text(table.tag)); }

      dlg.FirstItem = dlg.Combo.find(":first").data("table");
    }

    dlg.SelectTables = function (tables) {
      dlg.FillList();

      var opts = dlg.Combo.children();
      for (var iTable = 0; iTable < tables.length; iTable++) {
        var table = tables[iTable];
        for (var i = 0; i < opts.length; i++)
          if ($(opts[i]).data("table") == table)
            $(opts[i]).attr("selected", "selected");
      }

      dlg.UpdateFormat();
    }

    dlg.UpdateFormat = function () {
      var selected = $(dlg.Combo).find(":selected");
      var showMs = dlg.CheckMs.is(":checked");

      fmt = "{date} {time};";
      if (showMs)
        fmt += "{ms};";

      for (var i = 0; i < selected.length; i++)
        fmt += "{" + i + "}" + (i != selected.length - 1 ? ";" : "");
      fmt += "\\n";
      dlg.Format.attr("placeholder", fmt);
    }
    
    dlg.Download = function() {
      var tables = [];
      $(dlg.Combo).find(":selected").each(function () { tables.push($(this).data("table")); });
      var data = WebForms.FormatTables(tables, dlg.Format.val(), parseISOLocal(dlg.Start[0].value), parseISOLocal(dlg.End[0].value), dlg.CheckMs.is(":checked"));
      
      // Perform download of csv
      var link = document.createElement("a");
      
      var blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);            
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style = "visibility:hidden";
      
      if (navigator.msSaveBlob) { // IE 10+
        link.addEventListener("click", function (event) {
          var blob = new Blob([CSV], {
            "type": "text/csv;charset=utf-8;"
          });
          navigator.msSaveBlob(blob, "data.csv");
        }, false);
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    dlg.Combo.change(function () { dlg.UpdateFormat(); });
  }

  var dlg = WebForms.csvViewer;
  dlg.Show();

  if (format) dlg.Format.val(format); else dlg.Format.val("");
  dlg.Start[0].value = toISOLocaleString(prevYear());
  dlg.End[0].value = toISOLocaleString(currentDate());
  if (tables) dlg.SelectTables(tables);
  else { dlg.FillList(); dlg.SelectTables([dlg.FirstItem]); }
}

function prevYear(){
  var date = currentDate();
  date.setFullYear( date.getFullYear() - 1 );
  return date;
}

function currentDate(){
  var date = new Date();
  date.setHours(date.getHours() + 1);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setMilliseconds(0);
  return date;
}

pad = function (number) {
  if ( number < 10 ) {
    return '0' + number;
  }
  return number;
}

toISOLocaleString = function(D) {
  return D.getFullYear() +
    '-' + pad( D.getMonth() + 1 ) +
    '-' + pad( D.getDate() ) +
    'T' + pad( D.getHours() ) +
    ':' + pad( D.getMinutes() )
};

toLocaleDate = function(D) {
  return D.getFullYear() +
    '-' + pad( D.getMonth() + 1 ) +
    '-' + pad( D.getDate() )
};

toLocaleTime = function(D) {
  return pad( D.getHours() ) +
    ':' + pad( D.getMinutes() ) +
    ':' + pad( D.getSeconds() )
};

function parseISOLocal(s) {
  var b = s.split(/\D/);
  return new Date(b[0], b[1]-1, b[2], b[3], b[4]).getTime();
}

WebForms.DumpLine = function (line, tables, format, ms) {
  // {line};{date} {time};{0};{1};{2};{3};{4};{5};{6}\n
  if (format) {
    var res = format.replace(/{date}/, toLocaleDate(line.time));
    res = res.replace(/{ms}/, line.ms);
    res = res.replace(/{time}/, toLocaleTime(line.time));
    res = res.replace(/{line}/, line.id);

    for (var u = 0; u < tables.length; u++)
      res = res.replace(new RegExp("\\{" + u + "\\}", "g"), line.values[u] == undefined ? "" : line.values[u]);
  }
  else {
    res = toLocaleDate(line.time) + " " + toLocaleTime(line.time) + ";";
    if (ms)
      res += line.ms + ";";
    for (var u = 0; u < tables.length; u++)
      res += (line.values[u] == undefined ? "" : line.values[u]) + (u != tables.length - 1 ? ";" : "");
    res += "\n";
  }
  return res;
}

WebForms.DumpHeader = function (tables, format, ms) {
  // {line};{date} {time};{0};{1};{2};{3};{4};{5};{6}\n
  var res = "";
  if (format) {
    res = format.replace(/{date}/, "Date");
    res = res.replace(/{ms}/, "Ms");
    res = res.replace(/{time}/, "Time");
    res = res.replace(/{line}/, "Id");

    for (var u = 0; u < tables.length; u++)
      res = res.replace(new RegExp("\\{" + u + "\\}", "g"), tables[u].tag);
  }
  else {
    res = "Date" + ";";
    if (ms)
      res += "Ms" + ";";
    for (var u = 0; u < tables.length; u++)
      res += tables[u].tag + (u != tables.length - 1 ? ";" : "");
    res += "\n";
  }
  return res;
}

WebForms.FormatTables = function (tables, format, start, end, ms) {
  var out = "";
  var values = new Array();

  format = format.replace(/\\n/, "\n");

  // Merge all values from all tables
  for (var iTable = 0; iTable < tables.length; iTable++)
    for (var iValue = 0; iValue < tables[iTable].Values.length; iValue++)
      values.push({ tid: iTable, table: tables[iTable], v: tables[iTable].Values[iValue] })

  values.sort(function (a, b) { if (a.v[0] > b.v[0]) return 1; if (a.v[0] < b.v[0]) return -1; return 0; });
  
  out = WebForms.DumpHeader(tables, format, ms);

  var line = { id: 0, date: 0, values: null, prev: 0 };
  for (var i = 0; i < values.length; i++) {

    if (start && values[i].v[0] < start) continue;
    if (end && values[i].v[0] > end) break;

    // Is this a different line?
    if (values[i].v[0] != line.prev) {
      line.prev = values[i].v[0];

      if (line.values != null)
        out += WebForms.DumpLine(line, tables, format, ms);

      // Prepare a new line
      line.id++;
      line.date = (values[i].v[0] / 1000) | 0;
      line.ms = values[i].v[0] - (line.date * 1000);
      line.time = values[i].v[2];
      line.values = new Array(tables.length);
    }

    // Store value
    line.values[values[i].tid] = values[i].v[1];
  }

  if (line.values != null)
    out += WebForms.DumpLine(line, tables, format);

  return out;
}

jQuery.ajaxSetup({
  // Disable caching of AJAX responses 
  cache: false
});

if (!Array.indexOf) {
  Array.prototype.indexOf = function (obj, start) {
    for (var i = (start || 0); i < this.length; i++) {
      if (this[i] == obj) {
        return i;
      }
    }
    return -1;
  }
}

// Function allowing to retrieve the index of a data for a multi dim array
Array.prototype.multiIndexOf = function (obj, start, nIndexCol) {
  for (var i = (start || 0); i < this.length; i++) {
    if (this[i][nIndexCol] == obj) {
      return i;
    }
  }
  return -1;
}

Date.prototype.toCustomString = function (sMilli, format) {
  var myDate;

  if (WebForms.RtuTimeZone != null) { // Use RTU local time-zone
    var CurrentTime = this.getTime();
    if(CurrentTime != undefined && !isNaN(CurrentTime)) {
      myDate = new timezoneJS.Date(WebForms.RtuTimeZone);
      myDate.setTime(CurrentTime);
    }
  }
  else { // Use PC time-zone
    myDate = this;
  }
  
  if(myDate != undefined)
  {
    var date = myDate.getDate().toString(); // 31
    if (myDate.getDate() < 10) date = "0" + date;

    var month = (myDate.getMonth() + 1).toString();
    if (myDate.getMonth() < 9) month = "0" + month;

    var year = myDate.getFullYear().toString();  //2525

    var hours = (myDate.getHours()).toString(); // 23
    if (myDate.getHours() < 10) hours = "0" + hours;

    var min = myDate.getMinutes().toString(); //55
    if (myDate.getMinutes() < 10) min = "0" + min;

    var sec = myDate.getSeconds().toString(); //23
    if (myDate.getSeconds() < 10) sec = "0" + sec;

    var ms = myDate.getMilliseconds().toString(); //999
    if (myDate.getMilliseconds() < 100) ms = "0" + ms;
    if (myDate.getMilliseconds() < 10) ms = "0" + ms;


    if (format == "day") return (date);
    if (format == "month") return (month);
    if (format == "year4") return (year);
    if (format == "year2") return (year.substring(2, 4));
    if (format == "hour") return (hours);
    if (format == "min") return (min);
    if (format == "sec") return (sec);
    if (format == "date_eu") return (date + "/" + month + "/" + year);
    if (format == "date_us") return (month + "/" + date + "/" + year);
    if (format == "time_eu") return (hours + ":" + min + ":" + sec + (sMilli == "showMilli" ? ("." + ms) : ""));

    if (format == "time_us") {
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;

      if (sMilli == "showMilli")
        return (hours + ":" + min + ":" + sec + "." + ms + " " + ampm);
      else
        return (hours + ":" + min + ":" + sec + " " + ampm);

    }


    if (sMilli == "showMilli")
      return (year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec + "." + ms);
    return (year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec);
  }
}

String.prototype.toUTC = function () {
  // Tzo is used to convert utc to local time. Must be enhanced to every kind of offset (years to millisec) since we can have everything as rtu time.
  // First know how this delay between local and rtu time is retrieved (I suppose in utc time)
  var tzo = new Date().getTimezoneOffset();
  var str = new String(this);
  var year = parseInt(str.substring(0, 4), 10);
  var month = parseInt(str.substring(5, 7), 10) - 1;
  var day = parseInt(str.substring(8, 10), 10);
  var hour = parseInt(str.substring(11, 13), 10);
  var min = parseInt(str.substring(14, 16), 10);
  var sec = parseInt(str.substring(17, 19), 10);
  var ms;
  if ((str[19] != undefined) && (str[19] != null) && (str[19] != NaN))
    ms = parseInt(str.substring(20, 23), 10);
  else ms = 0;
  var utct = Date.UTC(year, month, day, hour, min, sec, ms) + tzo * 60000;
  return utct;
}

function GetUtcPC() { return new Date().getTime() / 1000; }

function BuildList(Indices, Source, Field) {
  var Result = new Array(Indices.length);
  for (var i = 0; i < Indices.length; i++) Result[i] = Field ? Source[Indices[i]][Field] : Source[Indices[i]];
  return Result;
}

function GetAllItems(Source, Field) {
  var Result = new Array(Source.length);
  for (var i = 0; i < Source.length; i++) Result[i] = Field ? Source[i][Field] : Source[i];
  return Result;
}

function FindItem(Source, Field, Value) {
  for (var i = 0; i < Source.length; i++) {
    if (Source[i][Field] == Value)
      return Source[i];
  }

  return null;
}

function ToolTipShow(Text) { }
function ToolTipHide() { }

function AddCss(rule, css) {
  var style = $("#WFStyle");
  if (style.length == 0)
    style = $("<style id='WFStyle' type='text/css'/>").appendTo("head");

  css = JSON.stringify(css).replace(/"/g, "").replace(/,/g, ";");
  style.append(rule + css + "\n\n");
}
function num2dot(num) {
  var d = num % 256;
  for (var i = 3; i > 0; i--) {
    num = Math.floor(num / 256);
    d = num % 256 + '.' + d;
  }
  return d;
}

function GetHttpParams(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(window.location.href);
  return (results == undefined) ? undefined : results[1];
}

function RegionNumber(value, precision) {
  if(value != null) {
    var r = (precision ? Number(value).toFixed(precision) : value).toString();

    if (WebForms.DecimalChar == ".")
      return r;

    r = r.replace(".", WebForms.DecimalChar);

    return r;
  }
}

function NumToBin(value, size) {
  var raw = value.toString(2);
  var digits = size - raw.length;

  for (var i = 0; i < digits; i++)
    raw = "0" + raw;

  return raw;
}

function ApplyFormatToValue(TagData) {

  var value = TagData.Value;
  var format = TagData.Format;
  var on = TagData.on;
  var off = TagData.off;
  var unit = TagData.unit;
  var description = TagData.description;
  var precision = TagData.precision;
  var type = TagData.type;
  var comment = TagData.comment;

  var RegionalValue = type == "Text" ? value : RegionNumber(value, precision);

  if (format == "%V")
    return RegionalValue;

  if (format == undefined)
    return undefined;

  //formula --> because of re-entratnt ApplyFormatToValue function --> must be the first format to manage
  var FormulaFormatIndex = format.indexOf("%f(");
  if (FormulaFormatIndex != -1) {
    var Formula = format.substr(FormulaFormatIndex + 3, format.indexOf(",", FormulaFormatIndex) - (FormulaFormatIndex + 3));
    var FormulaResultFormat = format.substr(format.indexOf(",", FormulaFormatIndex) + 1, format.indexOf(")", FormulaFormatIndex) - format.indexOf(",", FormulaFormatIndex) - 1);
    var FormulaResultValue = eval(Formula.replace("value", value));
    FormulaResultValue = ApplyFormatToValue({ Format: FormulaResultFormat, Value: FormulaResultValue, on: on, off: off, unit: unit, description: description, precision: precision });
    format = format.replace("%f(" + Formula + "," + FormulaResultFormat + ")", FormulaResultValue.toString());
  }

  if (value.toString() == "1")
    format = format.replace("%C", (on != undefined) ? on : "");
  else
    format = format.replace("%C", (off != undefined) ? off : "");

  if (format.indexOf("%I") != -1) format = format.replace("%I", num2dot(parseInt(value), 10));

  // Dates
  if (format.indexOf("%EU") != -1) format = format.replace("%EU", new Date(value * 1000).toCustomString("", "date_eu"));
  if (format.indexOf("%US") != -1) format = format.replace("%US", new Date(value * 1000).toCustomString("", "date_us"));
  if (format.indexOf("%TEU") != -1) format = format.replace("%TEU", new Date(value * 1000).toCustomString("", "time_eu"));
  if (format.indexOf("%TUS") != -1) format = format.replace("%TUS", new Date(value * 1000).toCustomString("", "time_us"));
  if (format.indexOf("%d") != -1) format = format.replace("%d", new Date(value * 1000).toCustomString("", "day"));
  if (format.indexOf("%m") != -1) format = format.replace("%m", new Date(value * 1000).toCustomString("", "month"));
  if (format.indexOf("%y") != -1) format = format.replace("%y", new Date(value * 1000).toCustomString("", "year2"));
  if (format.indexOf("%Y") != -1) format = format.replace("%Y", new Date(value * 1000).toCustomString("", "year4"));
  if (format.indexOf("%H") != -1) format = format.replace("%H", new Date(value * 1000).toCustomString("", "hour"));
  if (format.indexOf("%M") != -1) format = format.replace("%M", new Date(value * 1000).toCustomString("", "min"));
  if (format.indexOf("%S") != -1) format = format.replace("%S", new Date(value * 1000).toCustomString("", "sec"));

  if (unit != undefined && unit != "") format = format.replace("%U", unit);
  if (description != undefined && description != "") format = format.replace("%D", description);
  if (comment != undefined && comment != "") format = format.replace("%c", comment);
  if (precision != undefined && precision != "") format = format.replace("%V", Number(value).toFixed(precision));

  format = format.replace("%V", RegionalValue);

  if (format.indexOf("%W.") != -1) {
    format = format.replace("%W.8", NumToBin(value, 8));
    format = format.replace("%W.16", NumToBin(value, 16));
    format = format.replace("%W.24", NumToBin(value, 24));
    format = format.replace("%W.32", NumToBin(value, 32));
  }

  //timec HH:MM:SS format based on number of seconds 
  if (format.indexOf("%TIME_HMS") != -1) {
    var T_Seconds_Days = Math.floor(value / 86400);
    var T_Seconds_Hour = Math.floor((value - (T_Seconds_Days * 86400)) / 3600);
    var T_Seconds_Minutes = Math.floor((value - (T_Seconds_Days * 86400) - (T_Seconds_Hour * 3600)) / 60);
    var T_Seconds_Seconds = value - (T_Seconds_Days * 86400) - (T_Seconds_Hour * 3600) - (T_Seconds_Minutes * 60);
    if (T_Seconds_Days != 0)
      format = format.replace("%TIME_HMS", T_Seconds_Days + "." + LeadingChars(T_Seconds_Hour.toString(), 2, "0") + ":" + LeadingChars(T_Seconds_Minutes.toString(), 2, "0") + ":" + LeadingChars(T_Seconds_Seconds.toString(), 2, "0"));
    else
      format = format.replace("%TIME_HMS", LeadingChars(T_Seconds_Hour.toString(), 2, "0") + ":" + LeadingChars(T_Seconds_Minutes.toString(), 2, "0") + ":" + LeadingChars(T_Seconds_Seconds.toString(), 2, "0"));

  }

  //timec HH:MM format based on number of minutes 
  if (format.indexOf("%TIME_HM") != -1) {
    var T_MINUTES_Hour = Math.floor(value / 60);
    var T_MINUTES_Minutes = value - (T_MINUTES_Hour * 60);
    format = format.replace("%TIME_HM", LeadingChars(T_MINUTES_Hour.toString(), 2, "0") + ":" + LeadingChars(T_MINUTES_Minutes.toString(), 2, "0"));
  }

  //password format				
  var PwdFormat = format.match(/%.P/);
  if (PwdFormat != undefined) {
    var PwdChar = format.substr(PwdFormat.index + 1, 1);
    var pswString = "";
    for (i = 0; i < value.toString().length; i++)
      pswString = pswString + PwdChar;

    format = format.replace("%" + PwdChar + "P", pswString);
  }

  //engineer format 12.356e+3  (exp from 0 to 9)
  var EngFormat = format.match(/%\dE/);
  if (EngFormat != undefined) {
    var NumberOfDecimalsEng = format.substr(EngFormat.index + 1, 1);
    format = format.replace("%" + NumberOfDecimalsEng + "E", parseFloat(value).toExponential(NumberOfDecimalsEng));
  }

  //presicion format 1234500 (precision from 0 to 9)
  var PrecisionFormat = format.match(/%\dp/);
  if (PrecisionFormat != undefined) {
    var PrecisionNb = format.substr(PrecisionFormat.index + 1, 1);
    var valuestr = value.toString();
    var valuelen = valuestr.length;
    if ((valuelen > parseInt(PrecisionNb) + 1) && (valuestr.indexOf(".") != -1))
      format = format.replace("%" + PrecisionNb + "p", value.toPrecision(parseInt(PrecisionNb)));
    else
      format = format.replace("%" + PrecisionNb + "p", value);
  }

  //Start processing %2.1F Format - Must stay the last format to be checked!!!!!!!!
  var pos_percent = format.indexOf("%");
  var pos_dot = format.indexOf(".", format.indexOf("%"))
  var pos_F = format.indexOf("F", format.indexOf("."))

  var NumberOfDecimals = parseInt(format.substr(pos_dot + 1, pos_F - pos_dot));
  var NumberOfLeadingZero = parseInt(format.substr(pos_percent + 1, pos_dot - pos_percent));

  if (pos_percent != -1 && NumberOfDecimals != undefined && isNaN(NumberOfDecimals) == false && NumberOfLeadingZero != undefined) {
    if (isNaN(NumberOfLeadingZero) == true) //there is no leading zero defined - %.3F
      NumberOfLeadingZero = "";

    var valueWithDec = Number(value).toFixed(NumberOfDecimals).replace(".", WebForms.DecimalChar);
    var I;

    if (NumberOfDecimals != "0") //take the "." in account or not
      var NbreofZeroToAdd = NumberOfLeadingZero - (valueWithDec.length - NumberOfDecimals - 1);
    else
      var NbreofZeroToAdd = NumberOfLeadingZero - (valueWithDec.length - NumberOfDecimals);

    for (I = 0; I < NbreofZeroToAdd; I++) //Add 0
    {
      valueWithDec = "0" + valueWithDec;
    }

    format = format.replace("%" + NumberOfLeadingZero + "." + NumberOfDecimals + "F", valueWithDec);
  }
  //End of %2.1F Format

  return format;
}

//
// Fill string (number) with leading chars (often "0")
//
// source : string source
// length : total length with leading chars to get
// chartoAdd : Leading char to add
//
function LeadingChars(source, length, chartoAdd) {
  var dest_string = source;
  for (var I = 0; I < (length - source.length); I++)
    dest_string = chartoAdd + dest_string;
  return dest_string;
}
// TODO: review usefulness
function GetHistoryTag(historyName) {
  var Table = FindItem(PageData.Sampling, "name", historyName);
  return Table ? Table.tag: null;
}

function MergeTable(Values, NewValues, Trim) {

  if (NewValues.length == 0)
    // Nothing to merge: no new data, leave the target array unchanged
    return Values;

  if (Values.length == 0)
    // Nothing to merge: target array is empty, move whole array
    return NewValues.length > Trim ? NewValues.slice(0, Trim) : NewValues;

  var LastDate = Values[0][0];

  for (var iData = NewValues.length - 1; iData >= 0; iData--) {
    var data = NewValues[iData];

    if (data[0] > LastDate)
      // Prepend data if newer
      Values.unshift(data);
  }

  return (Values.length > Trim) ? Values.slice(0, Trim) : Values;
}

function MatchHistoryName(HistoryName, PartialName) {
  // TODO: use this when constructing the target list
  //try to match 'HistoryName' with the RegEx 'PartialName'
  if (!HistoryName)
    return 0;
  if (PartialName.indexOf('*') < 0) {
    if (HistoryName == PartialName)
      return 1;
    return 0;
  }
  PartialName = PartialName.replace("*", "(.)*");
  var regex = new RegExp(PartialName);
  if (HistoryName.match(regex))
    return 1;
  return 0;
}

WebForms.InitLocalTime = function () {
  if (WebForms.ShowRtuLocalTime == true) {
    // Initialize time-zone library
    timezoneJS.timezone.loadingScheme = timezoneJS.timezone.loadingSchemes.MANUAL_LOAD;
    timezoneJS.timezone.loadZoneJSONData('api/localtime.json', true);

    // Get retrieved time zone name
    var list = [];
    $.map(timezoneJS.timezone.zones, function (item, key) { list.push({ key: key, item: item }); });
    WebForms.RtuTimeZone = list[0].key;
  }
}

WebForms.InitChronoData = function () {
  // Init Chrono Data
  for (var iChrono = 0; iChrono < PageData.Chronologies.length; iChrono++) {
    PageData.Chronologies[iChrono].Values = [];
    var Data = new Object();
    Data.TagIndex = PageData.Chronologies[iChrono].TagIndex;
    Data.IdxTable = iChrono;
    WebForms.ChronoIndices.push(Data);
  }
}

//MessageBox function for Script
function MessageBox(title, content, type, width, align) {
  var dlg = new InputDialog("msgBox", title, width);
  dlg.AddLabel(null, content);
  dlg.AddButton("OK", function () { this.Remove(); });
  dlg.Show();
}

function ConfirmationBox(title, content, idToReturn, width) {
  if(width == undefined) width="auto";
  var dlg = new InputDialog("confirmationDlg", title, width);
  dlg.AddLabel(null, content);
  dlg.AddButton("Ok", function (Values) {
    WebForms.ConfirmationCallback(idToReturn, true);
    this.Remove();
  });
  dlg.AddButton("Cancel", function (Values) {
    WebForms.ConfirmationCallback(idToReturn, false);
    this.Remove();
  });
  
  dlg.Show();
}

function MessageBoxTimed(title, text, timeout, handler) {
  var dlg = new InputDialog("msgBoxTimed", title);
  dlg.Timeout = timeout;
  dlg.Stop = false;
  dlg
    .AddLabel(text)
    .AddLabel(timeout + "s", undefined, "timeout")
    .AddButton("OK", function () { this.Remove(); this.Stop = true; if (handler) handler(true); })
    .AddButton(WebForms.Language.Cancel, function () { this.Remove(); this.Stop = true; if (handler) handler(false); })
    .Show();

  dlg.GetElement("timeout").css("font-size", "16px");

  WebForms.CreateTask(function () {
    if (this.Stop)
      return false;

    this.GetElement("timeout").text(--this.Timeout + "s");

    if (this.Timeout == 0) {
      this.Remove();
      if (handler)
        handler(true);
      return false;
    }

    return true;
  },
  1000, dlg);
}

function _InputBox(title, content, defaultValue, idToReturn, width, password) {
  if (width == undefined) width = "40%";
  var inpb = new InputDialog("msgbox", title, width, "20%");
  inpb.AddLabel("", content);
  if(!password)
    inpb.AddInput(defaultValue, defaultValue, "Value");
  else
    inpb.AddPassword(defaultValue, defaultValue, "Value");
  inpb.AddButton("Ok", function (Values) {
    WebForms.InputCallback(idToReturn, Values["Value"]);
    this.Remove();
  });
  inpb.Show();
}

function InputBox(title, content, defaultValue, idToReturn, width) {
  _InputBox(title, content, defaultValue, idToReturn, width, false);
}

function InputBoxPassword(title, content, defaultValue, idToReturn, width) {
   _InputBox(title, content, defaultValue, idToReturn, width, true);
}

function SetLanguageLogoutMessage(Text) {
  WebForms.Session.LogoutText = Text;
}

function SetLanguageButtonTitle(Text) {
  WebForms.Language.Identification = Text;
}

function SetLanguageLogin(Text) {
  WebForms.Language.Login = Text;
}

function SetLanguageLogout(Text) {
  WebForms.Language.Logout = Text;
}

function SetLanguagePassword(Text) {
  WebForms.Language.Password = Text;
}

function SetLanguageAuthenticationFailed(Text) {
  WebForms.Language.AuthFailed = Text;
}

function SetLanguageUserLevel(Text) {
  WebForms.Language.UserLevel = Text;
}

function SetLanguageBuiltOn(Text) {
  WebForms.Language.BuiltOn = Text;
}

function SetLanguageYes(Text) {
  WebForms.Language.Yes = Text;
}

function SetLanguageNo(Text) {
  WebForms.Language.No = Text;
}

function SetLanguageCancel(Text) {
  WebForms.Language.Cancel = Text;
}

function GetTagByName(Name) { return FindItem(PageData.Tags, "name", Name); }

function FindTagIndex(Target, TagName) {
  if (Target.Tags.length == 0)
    return 0;

  return Target.Tags.indexOf(TagName);
}

function SetTagObjectValue(TagObject, value) {
  TagObject.Previous = TagObject.Value;
  TagObject.Value = value;

  // Check for modification
  var Modified = TagObject.Value != TagObject.Previous;

  // Dispatch to all its targets
  for (var iTarget = 0; iTarget < TagObject.Targets.length; iTarget++) {
    var target = TagObject.Targets[iTarget];

    TagObject.Format = target.Format;
    var Formatted = ApplyFormatToValue(TagObject);

    if (target.callback) {
      //! Tag to watch
      if (Modified)
        target.callback(TagObject.Value, Formatted, TagObject.name);
    }
    else {
      //! Object
      target.onReceive(TagObject.Value, Formatted, TagObject.name, FindTagIndex(target, TagObject.name));

      if (Modified && !target.DisableGenericValueChanged)
        $(target.Element).trigger("OnValueChanged", [TagObject.Value, Formatted, TagObject.name]);
    }
  }
}

function SetTagValue(name, value) {
  var TagObject = GetTagByName(name);

  SetTagObjectValue(TagObject, value);
}

function GetTagValue(name, displayas, format) {
  var Tag = GetTagByName(name);

  if (Tag != null) {
    if (displayas == "formatted") {
      Tag.Format = format;
      return ApplyFormatToValue(Tag);
    }

    return Tag.Value;
  }

  return undefined;
}

function WriteDigitalTag(tag, value) { WriteTag(tag, value); }
function WriteAnalogTag(tag, value) { WriteTag(tag, value); }
function RegisterCallback(tag, displayas, callback, format) { WebForms.AddTagTarget(tag, { callback: callback, Format: format, DisplayAs: displayas }); }

function WriteTag(tagName, value) {
  var tag = GetTagByName(tagName);
  if (tag != null && value != undefined)
    rtu.SetTag(tag.id, value);
}


var Tags = (window["Proxy"] != undefined) ? new Proxy({}, {
  set: function (target, name, value) { WriteTag(name, value); },
  get: function (target, name) { return GetTagValue(name, "value"); }
}) : null;

if (window.requestAnimationFrame === undefined) {
  console.warn("This browser doesn't support requestAnimationFrame, WebForms will emulate this feature.");
}
window.WFrequestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (f) { setTimeout(f, 1); };
function WorkerEmulation(filename) {

  // Create a stack that will hold messages until script is loaded
  this.stack = new Array();

  // Load the script
  var context = this;
  this.script = document.createElement("script");
  this.script.src = filename;
  this.script.onload = function () { context.processStack(); }

  document.head.appendChild(this.script);
}

WorkerEmulation.prototype.processStack = function () {
  // Process and destroy the stack
  var context = this;
  self.postMessageEmulated = function (data) { context.onmessage({ data: data }); }

  this.postMessage = this.postMessage2;

  for (var i = 0; i < this.stack.length; i++)
    this.postMessage(this.stack[i]);

  this.stack = undefined;
}

WorkerEmulation.prototype.postMessage2 = function (message) { self.onmessage({ data: message }); }
WorkerEmulation.prototype.postMessage = function (message) { if (this.stack != undefined) this.stack.push(message); }

if (window.Worker === undefined) {
  console.warn("This browser doesn't support web workers, WebForms will emulate this feature.");
  window.Worker = WorkerEmulation;
}
function WFInstance(Element) { return $(Element).data("instance"); }

//
// WebForms initialization
//
$(function () {
  
  WebForms.FirstLoad = true;
  
  // Create old-style elements
  $("[data-type]").each(WebForms.CreateElement);

  // Create script based elements
  if (PageData.Objects)
    for (var i = 0; i < PageData.Objects.length; i++)
      WebForms.BuildObject(PageData.Objects[i]);

  // Build lists of tags, sampling tables and chronologies
  // and bind them to their target objects
  WebForms.CreateLists();
  WebForms.FillTargets();

  // Initialize each object
  $("[data-type]").each(WebForms.InitializeElement);

  // Register events to objects
  WebForms.ConvertEvents();

  // Call load event for each control
  $("[data-type]").trigger("load");

  // Trigget the pageready event, which indicates that WebForms is in a working state
  $(document).trigger("pageready");

  WebForms.InitLocalTime();

  // Obtain information about the device and the current session
  PageData.Session = { level: 0, user: "" };
  WebForms.InitializeSession();
  
  // Init All Chrono
  if(WebForms.IncludeAllChronologies != undefined && WebForms.IncludeAllChronologies == "yes")
    WebForms.InitChronoData();
  
  // Activate all registered timers
  WebForms.ActivateTimers();

  $("#IdentificationMenu").hide();
  $("#ErrorBox").hide();

  if (WebForms.ShowIdentification)
    WebForms.Session.ShowIdentificationButton();

  if (PageData.PageTimeout > 0) {
    PageData.InactiveTime = 0;
    setInterval(WebForms.CheckTimeout, 60000);
  }

  // Reset timeout on mouse move
  $(document).mousemove(function () { PageData.InactiveTime = 0; });

  InitializeTagToWatch();
});
///#DEBUG
function Debug_Clear() {
  var dbg = $("#dbg");
  if (dbg.length == 0) {
    dbg = $("<div id='dbg'/>");
    $(document.body).append(dbg);
  }

  dbg.empty();
  dbg.show();
}

function Debug_Write(key, str) {
  var dbg = $("#dbg");
  if (str != undefined) {
    dbg.append("<b>" + key + "</b>: " + str);
    dbg.append("<br/>");
  }
}

function Debug_Move(e) {
  var dbg = $("#dbg");
  dbg.css("left", e.pageX);
  dbg.css("top", e.pageY);
}

function Debug_Element(e) {
  if (!e.shiftKey) {
    Debug_Hide();
    return;
  }
  Debug_Clear();
  var p = $(this).data("instance");
  $.map(p, function (item, key) {
    if (typeof (item) != "function" && typeof (item) != "object")
      Debug_Write(key, item);
  });
  Debug_Move(e);
}

function Debug_Hide() {
  var dbg = $("#dbg");
  dbg.hide();
}
///#ENDDEBUG
function InputDialog(name, title, size, height) {
  this.onCreate = function (name, title) {
    this.name = name;

    this.CloseOnEscape = false;

    var p = this.CreateDialog();
    p.css("z-index", this.getMaxZIndex() + 1);
    
    if (size) p.css("width", size + "px");
    if (height) p.css("height", height + "px");

    // Clear the user area
    this.UserArea.empty();

    // Set the title
    this.SetTitle(title);
  }

  /////////////////////////////////////////////////////////////////////////////

  this.CreateDialog = function () {
    $(document.body).append(this.Element = $("<div id='" + this.name + "' class='dialog'/>"));

    // Add the titlebar
    var titleArea = $("<div id='title'/>");
    titleArea.append($("<div id='titleText' />"));
    this.Element.append(titleArea);

    // Close button
    var closeButton = $("<div id='close'/>");
    closeButton.click($.proxy(function () { this.onClose(); }, this));
    titleArea.append(closeButton);

    // Add the user area
    this.Element.append(this.UserArea = $("<div id='user'/>"));

    // Hide the dialog and attach it to the page
    this.Element.hide();

    // Create overlay
    var o = $(".dialogoverlay");
    if (o.length == 0) {
      o = $("<div class='dialogoverlay'/>");
      o.hide();
      $(document.body).append(o);
    }
    this.Overlay = o;

    this.Element
      .attr("tabindex", 1)
      .keydown($.proxy(function (e) { if (e.keyCode == 27 && this.CloseOnEscape) this.onClose(); }, this));

    this.LastControl = null;
    return this.Element;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.MoveItem = function (id, x, y) {
    this.GetItem(id).css({ position: "absolute", left: x + "px", top: y + "px", margin: 0 });
    return this;
  }

  this.MoveElement = function (name, x, y) {
    this.GetElement(name).css({ position: "absolute", left: x + "px", top: y + "px", margin: 0 });
    return this;
  }
  
  /////////////////////////////////////////////////////////////////////////////
  
  this.getMaxZIndex = function() {
    let maxZIndex = 0;
    $('*').each(function() {
        let zIndex = parseInt($(this).css('z-index'), 10);
        
        if (!isNaN(zIndex) && zIndex > maxZIndex) {
            maxZIndex = zIndex;
        }
    });
    return maxZIndex;
  }
  
  /////////////////////////////////////////////////////////////////////////////

  this.SetTitle = function (title) { $("#titleText", this.Element).text(title); return this; }
  this.Center = function () { var parent = $("div:first"); this.Element.css({ "left": ((parent.width() - this.Element.width()) / 2) + "px", "top": ((parent.height() - this.Element.height()) / 2) + "px" }); return this; }
  this.Show = function () {  this.Overlay.fadeIn(); this.Center().BringToFront().Element.fadeIn().focus(); return this; }
  this.Hide = function () { this.Element.fadeOut(); this.Overlay.fadeOut(); }
  this.Remove = function () { this.Element.fadeOut(function () { $(this).remove(); }); this.Overlay.fadeOut(); }
  this.onClose = this.Remove;
  this.BringToFront = function () { this.Overlay.parent().append(this.Overlay); this.Element.parent().append(this.Element); return this; }
  this.GetItem = function (selector) { return $(selector, this.UserArea); }

  /////////////////////////////////////////////////////////////////////////////

  this.AddCustom = function (content) {
    this.UserArea.append(content);
    this.LastControl = content;

    return this;
  }

  this.AddLabel = function (name, value, id) {
    if (name) {
      var lblName = $("<div class='label' />");
      if (value != undefined)
        lblName
          .css("font-weight", "bold")
          .text(name + ":");
      else
        value = name;
    }

    var lblValue = $("<div class='label' />");
    if (value != undefined) {
      value = String(value);
      value = value.split("\n").join("<br/>");
      value = value.split(/\\r/g).join("");
      value = value.split(/\\n/g).join("<br/>");
      lblValue.html(value);
      if (id != undefined)
        lblValue.attr("data-resid", id);
    }

    var fs = $("<fieldset/>");

    if (name)
      fs.append(lblName);
    fs.append(lblValue);

    this.UserArea.append(fs);
    this.LastControl = fs;

    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddButton = function (name, click, ext, id) {
    var btn = $("<button/>");
    btn
      .text(name)
      .attr("data-resid", id)
      .click($.proxy(function () { $.proxy(click, this)(this.GetAllValues(), this.UserArea, ext); }, this));

    this.UserArea.append(btn);

    this.LastControl = btn;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddCheckbox = function (name, value) {
    var cb = $("<input type='checkbox'/>");

    cb
      .attr("id", name)
      ;

    this.UserArea.append(cb);

    this.LastControl = cb;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddInput = function (name, value, id, size, type) {
    var inp = $("<input type='" + (type || "text") + "'/>");

    if (size)
      inp.attr("size", size);

    this.UserArea.append(inp);

    inp
      .attr("placeholder", name)
      .val(value)
      .attr("data-resid", id)
      .focus();

    this.LastControl = inp;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddPassword = function (name, value, id, size) {
    var inp = $("<input type='password'/>");

    if (size)
      inp.attr("size", size);

    this.UserArea.append(inp);

    inp
      .attr("placeholder", name)
      .val(value)
      .attr("data-resid", id)
      .focus();

    this.LastControl = inp;
    return this;
  }


  /////////////////////////////////////////////////////////////////////////////

  this.AddTextArea = function (name, width, height) {
    var ta = $("<textarea/>");
    this.UserArea.append(ta);
    ta
      .attr("id", name)
      .css({ "width": width + "px", "height": height + "px" })
      .focus();

    this.LastControl = ta;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddIPField = function (name, value) {

    var v = Number(value);
    value = String((v >> 24) & 0xff) + "." + String((v >> 16) & 0xff) + "." + String((v >> 8) & 0xff) + "." + String(v & 0xff);

    var o = WebForms.CreateInputIP(name, value);
    this.UserArea.append(o);

    this.LastControl = o;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddTimeField = function (name, value) {

    value = Number(value);

    var h = Math.floor(value / 60);
    var m = value % 60;
    value = LeadingChars(h.toString(), 2, "0") + ":" + LeadingChars(m.toString(), 2, "0");

    var o = WebForms.CreateInputTime(name, value);

    this.UserArea.append(o);

    this.LastControl = o;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddNumpad = function (name, value, fct) {
    var o = WebForms.CreateInputKeyboard(name, ['7', '8', '9', 'DEL', '4', '5', '6', '+/-', '1', '2', '3', 'Enter', '0', '.', '<--', 'Enter'], 4, fct);
    $("button:eq(11)", o).css({ "height": "86px", "z-index": 999 });
    this.UserArea.append(o);

    this.LastControl = o;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddKeyboard = function (name, value, fct) {
    var o = WebForms.CreateInputKeyboard(name, [
      '&', '@', '~', '#', '/', '(', ')', '^', '!', '-', '<--',
      '{', '}', '_', '$', '%', '*', '+', '=', '/', 'DEL', 'DEL',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '.',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Shift', 'Shift',
      'z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', 'Enter', 'Enter'
    ], 11, fct);

    $("button:eq(20)", o).css({ "width": "86px", "z-index": 999 });
    $("button:eq(53)", o).css({ "width": "86px", "z-index": 999 });
    $("button:eq(64)", o).css({ "width": "86px", "z-index": 999 });

    this.UserArea.append(o);
    this.LastControl = 0;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.AddComboBox = function (name, width, height, multi) {
    var lst = $("<select/>");
    if (multi)
      lst.attr("multiple", "multiple");
    this.UserArea.append(lst);
    lst
      .attr("id", name)
      .css({ "width": width + "px", "height": height + "px" })
      .focus();

    this.LastControl = lst;
    return this;
  }

  /////////////////////////////////////////////////////////////////////////////

  this.LineBreak = function () { this.UserArea.append("<br/>"); return this; }

  /////////////////////////////////////////////////////////////////////////////

  this.GetAllValues = function () {
    var res = {};
    var objs = $("[data-resid]", this.Element);
    for (var i = 0; i < objs.length; i++) {
      var obj = $(objs[i]);
      res[obj.data("resid")] = obj.val();
    }
    return res;
  }
  
  /////////////////////////////////////////////////////////////////////////////
  
  this.ShowLoginInputBox = function()
  {
    var Target = this;
    var dlg = new InputDialog("dlgdl", title);
    var obj = this;
    dlg.AddInput("", "", "value");
    dlg.LastControl.css({ "width": "500px", "text-align": "right" });
    dlg.LineBreak();
    
    dlg.AddKeyboard("keyboard", this.valueOf, function (key) {
      var inp = $("input:first", $(this).closest("#user"));
      var v = inp.val();
      var nv = v;
      switch (key) {
        case "DEL": nv = ""; break;
        case "<--": nv = v.substr(0, v.length - 1); break;

        case "Shift":
          $(this).toggleClass("pressed");
          dlg.Shift = $(this).hasClass("pressed");
          dlg.Element.find("button").each(function () {
            var t = $(this).text();
            if (t.length == 1)
              t = dlg.Shift ? t.toUpperCase() : t.toLowerCase();
            $(this).text(t);
          });
          break;

        case "Enter": $(Target).val(v);  dlg.Remove(); break;

        default:
          nv = v + $(this).text();
      }
      inp.val(nv);
    });
    dlg.CloseOnEscape = true;
    dlg.Show();
  }
  
  /////////////////////////////////////////////////////////////////////////////
  
  this.ShowPasswordInputBox = function()
  {
    var Target = this;
    var dlg = new InputDialog("dlgdl", title);
    var obj = this;
    dlg.AddPassword("", "", "value");
    dlg.LastControl.css({ "width": "500px", "text-align": "right" });
    dlg.LineBreak();
    
    dlg.AddKeyboard("keyboard", this.valueOf, function (key) {
      var inp = $("input:first", $(this).closest("#user"));
      var v = inp.val();
      var nv = v;
      switch (key) {
        case "DEL": nv = ""; break;
        case "<--": nv = v.substr(0, v.length - 1); break;

        case "Shift":
          $(this).toggleClass("pressed");
          dlg.Shift = $(this).hasClass("pressed");
          dlg.Element.find("button").each(function () {
            var t = $(this).text();
            if (t.length == 1)
              t = dlg.Shift ? t.toUpperCase() : t.toLowerCase();
            $(this).text(t);
          });
          break;

        case "Enter": $(Target).val(v);  dlg.Remove(); break;

        default:
          nv = v + $(this).text();
      }
      inp.val(nv);
    });
    dlg.CloseOnEscape = true;
    dlg.Show();
  }
  
  /////////////////////////////////////////////////////////////////////////////

  this.GetElement = function (id) {
    return $("[data-resid=" + id + "]", this.Element);
  }

  /////////////////////////////////////////////////////////////////////////////

  this.onCreate(name, title);
}
WebForms.Session = {
  //
  // User settings
  //
  LogoutText: "Logout?",
  OnLogin: function () { },
  OnLogout: function () { },
  OnStateChange: function (state) { },

  //
  // Members
  //
  CurrentState: 0,
  PreviousState: null,

  //
  // Methods
  //
  Start: function (login, pass, callback) {
    rtu.Login(login, pass, function (data) {
      PageData.Session.user = data[0].user;
      rtu.setSID(data[0].sid);
      WebForms.SetUserLevel(data[0].level);
      WebForms.Session.UpdateState(data[0].success == 1 ? 1 : 0).OnLogin();
      if (callback) callback(data[0].success == 1);
    });

    return this;
  },

  End: function (callback) {
    rtu.Logout(function (data) {
      PageData.Session.user = "";
      WebForms.SetUserLevel(data[0].level);
      WebForms.Session.UpdateState(0).OnLogout();
      if (callback) callback(data[0].success == 1);
    });

    return this;
  },

  LoginDialog: function () {
    var dlg = new InputDialog("dlgLogin", WebForms.Language.Identification, 250);
    dlg.AddInput(WebForms.Language.Login, "", "sessionLogin");
    dlg.AddPassword(WebForms.Language.Password, "", "sessionPass");
    dlg.AddLabel("", "", "error");
    dlg.LineBreak();
    WebForms.AllowInputBox == "yes" ? dlg.GetElement("sessionLogin").click(dlg.ShowLoginInputBox) : "";
    WebForms.AllowInputBox == "yes" ? dlg.GetElement("sessionPass").click(dlg.ShowPasswordInputBox) : "";
    dlg.AddButton("OK", function () {
      var vals = dlg.GetAllValues();
      WebForms.Session.Start(vals.sessionLogin, vals.sessionPass, function (success) {
        if (success)
          dlg.Remove();
        else
          dlg.GetElement("error").text(WebForms.Language.AuthFailed);
      });
    });
    dlg.AddButton(WebForms.Language.Cancel, function () { this.Remove(); });
    dlg.Show();
  },

  LogoutDialog: function (callback) {
    var dlg = new InputDialog("dlgLogout", WebForms.Language.Logout, 250);
    dlg.AddLabel("", WebForms.Session.LogoutText);
    dlg.AddButton(WebForms.Language.Yes, function () { this.Remove(); WebForms.Session.End(callback); });
    dlg.AddButton(WebForms.Language.No, function () { this.Remove(); });
    dlg.Show();
  },

  IdentificationDialog: function () {
    var dlg = new InputDialog("showIdent", WebForms.Language.Identification, 250);
    dlg.AddLabel(WebForms.Language.BuiltOn, "__DATE__");
    dlg.AddLabel("WebForms", "__WFVERSION__");
    dlg.AddLabel(WebForms.Language.UserLevel, WebForms.GetUserLevel());
    dlg.AddLabel(WebForms.Language.Login, PageData.Session.user || "N/A");
    dlg.AddButton("OK", function () { this.Remove(); });
    dlg.Show();
  },

  ShowIdentificationButton: function () {
    if ($(".IdentificationButton").length > 0)
      return;

    var idButton = $("<div class='IdentificationButton'/>");

    idButton
      .text(WebForms.Language.Identification)
      .click(ShowIdentification)
      .append($("#IdentificationMenu"))
      ;

    $("div:first").append(idButton);
    $("#menuIdentAbout").click(WebForms.Session.IdentificationDialog);
    $("#menuIdentLogin").click(function () {
      if (WebForms.Session.CurrentState == 0)
        WebForms.Session.LoginDialog();
      else
        WebForms.Session.LogoutDialog();
    });
  },

  //
  // Events
  //
  UpdateState: function (state) {
    if (WebForms.Session.PreviousState != state) {
      WebForms.Session.PreviousState = state;
      WebForms.Session.OnStateChange(state);
      WebForms.Session.CurrentState = state;
    }
    return this;
  }
};

WebForms.InitializeSession = function () {
  rtu.process([{ command: "GetStationDesc" }, { command: "GetSessionDesc" }], WebForms.GotDescriptions, { timeout: WebForms.TWAFirstRetrievedTimeout });
}

WebForms.GotDescriptions = function (data) {

  if (!data) {
    console.error("Failed to get station description");
    return;
  }

  var desc = data[0];
  var sess = data[1];

  //
  // Process station description
  //
  if (!wfStorage.AppKey || (wfStorage.AppKey != desc.key)) {
    // The application has changed since the last page refresh
    wfStorage.AppKey = desc.key;
    WebForms.FirstLoad = true;
  }

  // Store application key for upcoming requests
  rtu.appKey = desc.key;

  //
  // Process session description
  //
  PageData.Session = sess;

  rtu.setSID(sess.sid);

  WebForms.SetUserLevel(sess.level);
  WebForms.Session.UpdateState((sess.level > 0) ? 1 : 0);
  WebForms.BeginPeriodicRequests();
}

WebForms.GetAdvancedStationDescription = function (Callback)
{
  rtu.GetAdvancedStationDesc(Callback);
}

function ShowIdentification() {
  var btn = $(".IdentificationButton");
  var menu = $("#IdentificationMenu");
  if (menu.is(":hidden")) {
    $("#menuIdentLogin").text(WebForms.Session.CurrentState == 0 ? WebForms.Language.Login : WebForms.Language.Logout);
    menu.fadeIn();
    btn.css("margin-bottom", "40px");

    if (!PageData.HttpSession)
      $("#menuIdentLogin").hide();
  }
  else {
    menu.fadeOut();
    btn.css("margin-bottom", "0px");
  }
}

this.GetUserName = function() {
  return PageData.Session.user;
}

WebForms.SessionStart = WebForms.Session.Start;
WebForms.SessionEnd = WebForms.Session.End;
WebForms.SessionLoginDialog = WebForms.Session.LoginDialog;
WebForms.SessionLogoutDialog = WebForms.Session.LogoutDialog;
WebForms.SessionGetCurrentState = function () { return WebForms.Session.CurrentState; }
window.GetUserLevel = WebForms.GetUserLevel;
WebForms.ExtendClassRoot({
  /////////////////////////////////////////////////////////////////////////////
  GetObjectId: function () { return this.id; },
  GetAttribute: function (name) { return $(this.Element).data(name); },
  SetAttribute: function (name, value) { $(this.Element).data(name, value); },
  Show: function () { $(this.Element).fadeIn(); if($(this.Element).css("display") == "") {$(this.Element).css("display", "initial");} },
  Hide: function () { $(this.Element).fadeOut(); },
  IsVisible: function () { return $(this.Element).css("display") != "none"; },
  SetCursor: function (cur) { $(this.Element).css("cursor", cur); },
  SetText: function (Text) { $(this.Element).text(Text); },
  GetText: function () { return $(this.Element).text(); },
  GetValue: function () { return this.value; },
  GetWriteLevel: function () { return this.WriteLevel; },
  SetWriteLevel: function (level) { this.WriteLevel = level; if (this.onWriteEnable) { this.onWriteEnable(WebForms.GetUserLevel() >= this.WriteLevel); } },
  _SetWriteLevel: function (level) { this.WriteLevel = level; },
  GetVisibilityLevel: function () { return this.VisibilityLevel; },
  SetVisibilityLevel: function (level) { this.VisibilityLevel = level; },
  SetBackColor: function (Color) { $(this.Element).css("background-color", Color); this.BackColor = Color; },
  GetBackColor: function () { return this.BackColor; },
  SetTextColor: function (Color) { $(this.Element).css("color", Color); this.TextColor = Color; },
  GetTextColor: function () { return this.TextColor; },
  SetBorderColor: function (Color) { $(this.Element).css("border-color", Color); this.BorderColor = Color; },
  GetBorderColor: function () { return this.BorderColor; },
  SetFont: function (Font) { $(this.Element).css("font-family", Font); },
  GetFont: function () { return $(this.Element).css("font-family"); },
  SetFontSize: function (Size) { $(this.Element).css("font-size", Size + "px"); },
  GetFontSize: function () { return $(this.Element); },
  SetBorderSize: function (Size) { $(this.Element).css("border-width", Size); },
  GetBorderSize: function () { return $(this.Element).css("border-width"); },
  SetTextAlignment: function (Align) { if (Align == "middle") Align = "center"; $(this.Element).css("text-align", Align); },
  GetTextAlignment: function () { return $(this.Element).css("text-align"); },
  GetScaleMinimum: function () { return this.min; },
  SetScaleMinimum: function (Value) { this.min = Value; },
  GetScaleMaximum: function () { return this.max; },
  SetScaleMaximum: function (Value) { this.max = Value; },
  SetFontStyle: function (Style) {
    var p = $(this.Element);
    p.css("font-weight", Style.indexOf("B") >= 0 ? "bold" : "normal");
    p.css("font-style", Style.indexOf("I") >= 0 ? "italic" : "normal");
  },
  SetFontEx: function (ex) {
    ex = ex.split(";");
    for (var i = 0; i < 3; i++) {
      if (i > ex.length)
        return;
      var s = ex[i];
      if (s && s != "")
        switch (i) {
          case 0: this.SetFont(s); break;
          case 1: this.SetFontSize(s); break;
          case 2: this.SetFontStyle(s); break;
          case 3: this.SetTextColor(s); break;
        }
    }
  },
  SetAskForConfirmation: function (Ask) { this.AskForConfirmation = Ask == "yes" ? 1 : 0; },
  GetAskForConfirmation: function () { if(this.AskForConfirmation) return "yes"; else return "no"; },
  SetConfirmationQuestion: function (Question) { this.ConfirmationQuestion = (Question != "") ? Question : "Are you sure you want to modify the value ?"; },
  GetConfirmationQuestion: function () { return this.ConfirmationQuestion; },
  IsWriteAllowed: function () { return WebForms.GetUserLevel() >= this.WriteLevel; },
  SetRect: function (Rect) { var p = $(this.Element); var rect = Rect.split(";"); p.css({ left: rect[0] + "px", top: rect[1] + "px", width: rect[2] + "px", height: rect[3] + "px" }); this.Rect = rect; },
  SetHighlight: function (bEnable) { if (this.Grid) this.Grid.Highlight = bEnable; },

  /////////////////////////////////////////////////////////////////////////////

  SetPositionX: function (x) { this.SetRect(x + ";" + this.Rect[1] + ";" + this.Rect[2] + ";" + this.Rect[3]); },
  SetPositionY: function (y) { this.SetRect(this.Rect[0] + ";" + y + ";" + this.Rect[2] + ";" + this.Rect[3]); },
  SetWidth: function (w) { this.SetRect(this.Rect[0] + ";" + this.Rect[1] + ";" + w + ";" + this.Rect[3]); },
  SetHeight: function (h) { this.SetRect(this.Rect[0] + ";" + this.Rect[1] + ";" + this.Rect[2] + ";" + h); },
  SetPosition: function (x, y) { this.SetPositionX(x); this.SetPositionY(y); },

  /////////////////////////////////////////////////////////////////////////////

  ConfirmAndCall: function (okEvent, arg, onCancel) {
    if (this.AskForConfirmation) {
      var dlg = new InputDialog("confirmDlg", "Confirmation");
      var that = this;
      dlg.AddLabel("Warning", this.ConfirmationQuestion);
      dlg.AddButton("OK", function () { $.proxy(okEvent, that)(arg); this.Remove(); });
      dlg.AddButton(WebForms.Language.Cancel, function () { this.onClose(); });
      if (onCancel)
        dlg.onClose = onCancel;
      dlg.CloseOnEscape = true;
      dlg.Show();
      return true;
    }

    // No confirmation required
    $.proxy(okEvent, this)(arg);
    return false;
  },

  /////////////////////////////////////////////////////////////////////////////  

  AddHistory: function (HistoryName, Opt) {
    if (this.History == undefined)
      this.History = [];
    this.History.push(HistoryName);

    if (HistoryName == "ALARMS") {
      PageData.Alarms.Targets.push(this);
      if (Opt)
        Opt.Table = PageData.Alarms;
      return -1;
    }

    if (HistoryName.indexOf("ST - ") == 0) {
      var Table = FindItem(PageData.Sampling, "name", HistoryName);
      var Index = PageData.Sampling.indexOf(Table);
      PageData.Sampling[Index].Targets.push(this);
      if (Opt) {
        Opt.Table = PageData.Sampling;
        Opt.TableIndex = Index;
      }
      return Index;
    }
    else {
      var Table = FindItem(PageData.Chronologies, "name", HistoryName);
      var Index = PageData.Chronologies.indexOf(Table);
      PageData.Chronologies[Index].Targets.push(this);
      if (Opt) {
        Opt.Table = PageData.Chronologies;
        Opt.TableIndex = Index;
      }
      return Index;
    }
  },

  /////////////////////////////////////////////////////////////////////////////  

  RestructFmt: function (formatter, SourceString) {
    var Source = $(this.Element).data(SourceString).split(";");
    for (var i = 0; i < Source.length; i++)
      this[arguments[i + 2]] = formatter(Source[i]);

    return this;
  },

  /////////////////////////////////////////////////////////////////////////////

  Restruct: function (SourceString) {
    var Source = $(this.Element).data(SourceString).split(";");
    for (var i = 0; i < Source.length; i++)
      this[arguments[i + 1]] = Source[i];

    return this;
  },

  /////////////////////////////////////////////////////////////////////////////

  GetUValue: function () { return parseFloat(this.value).toFixed(this.Digits) + " " + (this.Units != undefined ? this.Units : ""); },
  GetRegionalValue: function () { return RegionNumber(this.value); },
  GetRegionalUValue: function () { return RegionNumber(this.GetUValue()); },

  /////////////////////////////////////////////////////////////////////////////

  AppendSVG: function (vx, vy, svg, preserveNone) {
    var r = $('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' + ((vx > 0 || vy > 0) ? 'viewBox="0 0 ' + vx + ' ' + vy + '"' : '') + (preserveNone ? '>' : ' preserveAspectRatio="none">') + svg + '</svg>');
    $(this.Element).empty().append(r);
    return r;
  },

  /////////////////////////////////////////////////////////////////////////////

  RangeFix: function (value, cb) {
    if (cb) $.proxy(cb, this)(value > this.max || value < this.min);
    if (value > this.max) return this.max;
    if (value < this.min) return this.min;
    return value;
  },

  /////////////////////////////////////////////////////////////////////////////

  ScaleFix: function (value, scaleMin, scaleMax, cb) {

    // Process out of range
    if (cb)
      $.proxy(cb, this)(value > this.max || value < this.min);

    // Fix range
    if (value > this.max) value = this.max;
    if (value < this.min) value = this.min;

    // Fix scale
    var ratio = (value - this.min) / (this.max - this.min);
    value = ratio * (scaleMax - scaleMin) + scaleMin;

    return value;
  },

  ///////////////////////////////////////////////////////////////////////////// 

  AddChoice: function (Name, Value, Data) { this.Choices.push({ Name: Name, Value: Value, Data: Data }); },

  /////////////////////////////////////////////////////////////////////////////

  BuildMenu: function () {
    if (this.Choices.length == 0)
      return;

    this.Menu = $("<div class='editionMenu'/>");
    this.Menu.css("min-width", this.Rect[2] + "px");
    this.Menu.hide();

    this.Menu.mouseleave(function () { $(this).hide(); });

    for (var i = 0; i < this.Choices.length; i++) {
      var choice = this.Choices[i];
      var item = $("<div class='editionMenuItem'/>");
      item
        .html(choice.Name)
        .data("menuvalue", choice)
        .click($.proxy(function (e) {
          if (this.OnItemClick)
            this.OnItemClick($(e.target).data("menuvalue"), $(e.target));
          this.Menu.hide();
        }, this));
      this.Menu.append(item);
    }

    $(document.body).append(this.Menu);

    return this.Menu;
  },

  ///////////////////////////////////////////////////////////////////////////// 

  ShowMenu: function (x, y) {
    this.Menu.css({ "left": x + "px", "top": y + "px" });
    this.Menu.show();
  },

  /////////////////////////////////////////////////////////////////////////////

  onRootCreate: function (Element, Config) {
    var p = $(Element);

    this.id = p.attr("id");
    this.value = 0;
    this.Previous = [];

    // Default values
    this.Rect = [0, 0, 0, 0];
    this.VisibilityLevel = 0;
    this.WriteLevel = 0;

    if (this.onDefault)
      this.onDefault();

    var that = this;
    $.map({
      "tag": function (tag) { this.Tag = tag; },
      "tagtype": function (type) { this.TagType = type; },
      "rect": this.SetRect,
      "background": this.SetBackColor,
      "textcolor": this.SetTextColor,
      "bordercolor": this.SetBorderColor,
      "cursor": this.SetCursor,
      "text": this.SetText,
      "font": this.SetFont,
      "fontex": this.SetFontEx,
      "fontsize": this.SetFontSize,
      "bordersize": this.SetBorderSize,
      "align": this.SetTextAlignment,
      "fontstyle": this.SetFontStyle,
      "ask": this.SetAskForConfirmation,
      "question": this.SetConfirmationQuestion,
      "visibility": this.SetVisibilityLevel,
      "write": this._SetWriteLevel,
      "minmax": function (mm) { this.RestructFmt(parseFloat, "minmax", "min", "max"); },
      "units": function (units) { this.Units = units; },
      "digits": function (digits) { this.Digits = digits; },
      "format": function (fmt) { this.Format = fmt; },
      "transparent": function (t) { this.Transparent = t; if (t == "yes") this.SetBackColor("Transparent"); },
      "tooltip": this.SetTooltip,

      "x": this.SetPositionX,
      "y": this.SetPositionY,
      "width": this.SetWidth,
      "height": this.SetHeight,
    },
    function (item, key) {
      if (Config) {
        if (Config[key] != undefined) $.proxy(item, that)(Config[key]);
      }
      else if (p.data(key) != undefined) $.proxy(item, that)(p.data(key));
    });

    // Focus on mouse down
    $(this.Element).mousedown(function () {
      var instance = $(this).data("instance");
      if (WebForms.Focused != instance) {
        $(this).focus();
        WebForms.Focused = instance;
      }
    });

    // Give the element a tab index
    $(this.Element).attr("tabindex", $(this.Element).index());

    // Handle tooltip
    $(this.Element).on("mousemove touchmove", $.proxy(function (e) {
      var t = $("#mainTooltip");
      if (this.Tooltip && this.Tooltip != "") {

        //  Create the tooltip if it doesn't exist yet
        if (t.length == 0)
          t = $("<div id='mainTooltip'/>");

        // Set the tooltip text
        var fixedTip = this.Tooltip
          .split("\\n").join("<br/>")
          .split("\n").join("<br/>")
          .split("<br>").join("<br/>")
          .split("</br>").join("<br/>");

        t.html(fixedTip);
        
        // Move it to the cursor position
        var x = e.pageX || e.originalEvent.touches[0].pageX;
        var y = e.pageY || e.originalEvent.touches[0].pageY;
        
        // Calculate the maximum allowed values for x and y based on the viewport dimensions
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var maxX = windowWidth - t.width() - 48;
        var maxY = windowHeight - t.height() - 48;
        
        // Adjust x and y to stay within the maximum allowed values
        x = Math.min(x, maxX);
        y = Math.min(y, maxY);
        
        // If the tooltip is positioned off the right side of the screen, move it to the left
        if (x + t.width() > windowWidth) {
          x = windowWidth - t.width() - 16;
        }
        
        // If the tooltip is positioned off the bottom of the screen, move it up
        if (y + t.height() > windowHeight) {
          y = windowHeight - t.height() - 16;
        }
        
        // If the tooltip is positioned off the left side of the screen, move it to the right
        if (x < 0) {
          x = 16;
        }
        
        // If the tooltip is positioned off the top of the screen, move it down
        if (y < 0) {
          y = 16;
        }
        
        // Set the position of the tooltip
        t.css({ "left": x + 16 + "px", "top": y + 16 + "px" });
        
        // Show it
        t.show();

        // Bring to front
        $(document.body).append(t);
      }
      else t.hide();
    }, this));

    $(this.Element).mouseleave(function () { $("#mainTooltip").hide(); })

    // Choice menu
    this.Choices = [];

    ///#DEBUG
    $(this.Element).mousemove(Debug_Element);
    $(this.Element).mouseleave(Debug_Hide);
    ///#ENDDEBUG    
  },

  /////////////////////////////////////////////////////////////////////////////

  SetTooltip: function (Text) { this.Tooltip = Text; },

  /////////////////////////////////////////////////////////////////////////////

  ConvertTag: function (value, subType) {
    switch (subType) {
      /*case "ip":
        break;*/
      case "ipaddress":
        //value = value.toString();
        var n = value.split(".");
        value = n[0] << 24 | n[1] << 16 | n[2] << 8 | n[3];
        break;
      case "ipaddress + keypad":
          //value = value.toString();
        var n = value.split(".");
        value = n[0] << 24 | n[1] << 16 | n[2] << 8 | n[3];
        break;
      /*case "time":
        break;*/
      case "hours:minutes":
        var n = value.split(":");
        value = Number(n[0] * 60) + Number(n[1]);
        break;
      case "hours:minutes + keypad":
        var n = value.split(":");
        value = Number(n[0] * 60) + Number(n[1]);
        break;
      default :
        if(this.TagType == "text") // Tag text
          value = value.toString();
        else // Tag digital or analog
          value = parseFloat(value);
        break;
    }

    return value;
  },

  /////////////////////////////////////////////////////////////////////////////

  WriteTag: function (value, subType) {
    WriteTag(this.Tag, this.ConvertTag(value, subType));
  },

  /////////////////////////////////////////////////////////////////////////////

  BeginEdition: function (type, title, label) {
    if ($(".editionArea", this.Element).length == 0) {
      var editionArea = $("<div class='editionArea'/>");
      this.Element.append(editionArea);
    }

    if ($(".editionObject", this.Element).length > 0)
      return;

    if (!this.IsWriteAllowed())
      return;

    // Create the editor
    var inp;
    var obj = this;

    switch (type) {
      case "standard":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddLabel(label);
        dlg.AddInput(label, this.value, "value");
        dlg.LineBreak();
        dlg.AddButton("OK", function (vals, UserArea, ext) {
          var pb = $("input:first", UserArea);
          ext.ValidateInput(pb, pb.val());
          this.Remove();
        }, this);
        dlg.AddButton(WebForms.Language.Cancel, function () { this.Remove() });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;

      case "password dialog":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddLabel(label);
        dlg.AddPassword(label, this.value, "value");
        dlg.LineBreak();
        dlg.AddButton("OK", function (vals, UserArea, ext) {
          var pb = $("input:first", UserArea);
          ext.ValidateInput(pb, pb.val());
          this.Remove();
        }, this);
        dlg.AddButton(WebForms.Language.Cancel, function () { this.Remove() });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;

      case "standard in cell":
        inp = $("<input class='editionObject' type='text'/>");
        inp.val(this.value);
        break;

      case "password":
        inp = $("<input class='editionObject' type='password'/>");
        inp.val(this.value);
        break;

      case "ipaddress":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddIPField("ip", this.value);
        dlg.LineBreak();
        dlg.AddButton("OK", function (vals, UserArea, ext) {
          var pb = $("#ip", UserArea);
          ext.ValidateInput(pb, pb.data("value"));
          this.Remove();
        }, this);
        dlg.AddButton(WebForms.Language.Cancel, function () { this.Remove() });
        dlg.CloseOnEscape = true;
        dlg.Show();
        return;

      case "ipaddress + keypad":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddIPField("ip", this.value);
        dlg.LineBreak();
        dlg.Current = 0;
        dlg.AddNumpad("numpad", this.value, function (key) {
          var inp = $("input:eq(" + dlg.Current + ")", dlg.Element);
          var v = String(inp.val());
          var nv;
          switch (key) {
            case ".":
              dlg.Current++;
              if (dlg.Current >= 4)
                dlg.Current = 0;
              $("input", dlg.Element).removeClass("selected");
              $("input:eq(" + dlg.Current + ")", dlg.Element).addClass("selected");
              return;
            case "Enter": obj.ValidateInput(inp, $("#ip", dlg.Element).data("value")); dlg.Remove(); return;
            case "<--": if (v.length) nv = v.substr(0, v.length - 1); break;
            case "DEL": nv = 0; break;
            default:
              if (v.length < 3) nv = v + key; else nv = key;
          }
          nv = Number(nv);
          if (nv > 255) return;
          inp.val(nv);
          inp.trigger("change");
        });
        $("input:first", dlg.Element).addClass("selected");
        $("input", dlg.Element).focus(function () {
          $("input", dlg.Element).removeClass("selected");
          $(this).addClass("selected");
          dlg.Current = $(this).index() / 2;
        });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;

      case "hours:minutes":
        var dlg = new InputDialog("dlgdl", "Time", 120);
        dlg.AddTimeField("time", this.value);
        dlg.LineBreak();
        dlg.AddButton("OK", function (vals, UserArea, ext) {
          var pb = $("#time", UserArea);
          ext.ValidateInput(pb, pb.data("value"));
          this.Remove();
        }, this);
        dlg.AddButton(WebForms.Language.Cancel, function () { this.Remove() });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;

      case "hours:minutes + keypad":
        var dlg = new InputDialog("dlgdl", "Time");
        dlg.Current = 0;
        dlg.AddTimeField("time", this.value);
        dlg.LineBreak();
        dlg.AddNumpad("numpad", this.value, function (key) {
          var inp = $("input:eq(" + dlg.Current + ")", dlg.Element);
          var v = String(inp.val());
          var nv;
          switch (key) {
            case ":":
            case ".":
              dlg.Current = dlg.Current ? 0 : 1;
              $("input", dlg.Element).removeClass("selected");
              $("input:eq(" + dlg.Current + ")", dlg.Element).addClass("selected");
              return;
            case "Enter": obj.ValidateInput(inp, $("#time", dlg.Element).data("value")); dlg.Remove(); return;
            case "<--": if (v.length) nv = v.substr(0, v.length - 1); break;
            case "DEL": nv = 0; break;
            default:
              if (v.length < 2) nv = v + key; else nv = key;
          }
          nv = Number(nv);
          if (dlg.Current == 1 && nv > 59) return;
          inp.val(nv);
          inp.trigger("change");
        });
        $("input:first", dlg.Element).addClass("selected");
        $("input", dlg.Element).focus(function () {
          $("input", dlg.Element).removeClass("selected");
          $(this).addClass("selected");
          dlg.Current = $(this).index() / 2;
        });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;

      case "keypad + password":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddPassword(label, this.value, "value"); // As for the other "case", it requires to use "this.value" because "this.GetText()" return the name of the tag and not the value
        dlg.LastControl.css({ "width": "180px", "text-align": "right" });
        dlg.LineBreak();
        dlg.AddNumpad("numpad", this.value, function (key) {
          var inp = $("input:first", $(this).closest("#user"));
          var v = inp.val();
          var nv = v;
          switch (key) {
            case "+/-": if (v[0] == '-') nv = v.substr(1); else nv = "-" + v; break;
            case "DEL": nv = 0; break;
            case "<--": nv = v.substr(0, v.length - 1); break;
            case ".": inp.val(Number(v) + "."); return;
            case "Enter": obj.ValidateInput(inp, Number(v)); dlg.Remove(); break;
            default:
              nv = v == "0" ? key : v + key;
          }
          inp.val(nv);
        });

        dlg.CloseOnEscape = true;
        dlg.Show();
        return;
        
      case "keypad":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddInput(label, this.value, "value"); // As for the other "case", it requires to use "this.value" because "this.GetText()" return the name of the tag and not the value
        dlg.LastControl.css({ "width": "180px", "text-align": "right" });
        dlg.LineBreak();
        dlg.AddNumpad("numpad", this.value, function (key) {
          var inp = $("input:first", $(this).closest("#user"));
          var v = inp.val();
          var nv = v;
          switch (key) {
            case "+/-": if (v[0] == '-') nv = v.substr(1); else nv = "-" + v; break;
            case "DEL": nv = 0; break;
            case "<--": nv = v.substr(0, v.length - 1); break;
            case ".": inp.val(Number(v) + "."); return;
            case "Enter": obj.ValidateInput(inp, Number(v)); dlg.Remove(); break;
            default:
              nv = v == "0" ? key : v + key;
          }
          inp.val(nv);
        });

        dlg.CloseOnEscape = true;
        dlg.Show();
        return;

      case "keyboard + password":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddPassword(label, this.value, "value"); // As for the other "case", it requires to use "this.value" because "this.GetText()" return the name of the tag and not the value
        dlg.LastControl.css({ "width": "500px", "text-align": "right" });
        dlg.LineBreak();
        dlg.AddKeyboard("keyboard", this.valueOf, function (key) {
          var inp = $("input:first", $(this).closest("#user"));
          var v = inp.val();
          var nv = v;
          switch (key) {
            case "DEL": nv = ""; break;
            case "<--": nv = v.substr(0, v.length - 1); break;

            case "Shift":
              $(this).toggleClass("pressed");
              dlg.Shift = $(this).hasClass("pressed");
              dlg.Element.find("button").each(function () {
                var t = $(this).text();
                if (t.length == 1)
                  t = dlg.Shift ? t.toUpperCase() : t.toLowerCase();
                $(this).text(t);
              });
              break;

            case "Enter": obj.ValidateInput(inp, v); dlg.Remove(); break;

            default:
              nv = v + $(this).text();
          }
          inp.val(nv);
        });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;
        
      case "keyboard":
        var dlg = new InputDialog("dlgdl", title);
        dlg.AddInput(label, this.value, "value"); // As for the other "case", it requires to use "this.value" because "this.GetText()" return the name of the tag and not the value
        dlg.LastControl.css({ "width": "500px", "text-align": "right" });
        dlg.LineBreak();
        dlg.AddKeyboard("keyboard", this.valueOf, function (key) {
          var inp = $("input:first", $(this).closest("#user"));
          var v = inp.val();
          var nv = v;
          switch (key) {
            case "DEL": nv = ""; break;
            case "<--": nv = v.substr(0, v.length - 1); break;

            case "Shift":
              $(this).toggleClass("pressed");
              dlg.Shift = $(this).hasClass("pressed");
              dlg.Element.find("button").each(function () {
                var t = $(this).text();
                if (t.length == 1)
                  t = dlg.Shift ? t.toUpperCase() : t.toLowerCase();
                $(this).text(t);
              });
              break;

            case "Enter": obj.ValidateInput(inp, v); dlg.Remove(); break;

            default:
              nv = v + $(this).text();
          }
          inp.val(nv);
        });
        dlg.CloseOnEscape = true;
        dlg.Show();
        break;

        ///#DEBUG                                                                                                                        
      default:
        console.debug("Unknown editor type: " + type);
        ///#ENDDEBUG     
    }

    // If the editor is embedded, handle it
    if (inp) {
      // Clear the edition area and add the editor
      $(".editionArea", this.Element)
          .empty()
          .append(inp);

      // Apply the text position
      if (this.TextPos)
        inp.css("text-align", (this.TextPos[2] == "middle") ? "center" : this.TextPos[2]);

      // Register events
      inp
      .keydown($.proxy(function (e) { var eo = $(".editionObject", this.Element); if (e.keyCode == 27) { eo.remove(); } if (e.keyCode == 13) { this.ValidateInput(eo, eo.val()); } }, this))
      .blur(function () { $(this).remove(); })
      .focus(function () { this.select(); })
      .focus();
    }
  }

  /////////////////////////////////////////////////////////////////////////////


});
function WebGrid(Container, Width, Height, HeaderHeight, FooterHeight) {

  this.Width = Width;
  this.Height = Height;
  this.HeaderHeight = HeaderHeight || 24;
  this.FooterHeight = FooterHeight || 24;

  this.CreateStructure();

  // Clear columns and rows
  this.Columns = [];
  this.Rows = [];
  this.LineColor = [];

  this.SelectedCell = null;
  this.Highlight = true;
  this.CellRef = [];
  this.CellRefValue = [];

  // If a container is specified, append the WebGrid frame to it
  if (Container)
    $(Container).append(this.Frame);

  this.UpdateLayout();
}

WebGrid.prototype.CreateStructure = function () {
  // Create each element
  var Frame = $("<div class='WebGrid'/>");
  this.wgContent = $("<div class='wgContent'/>");
  this.wgHeader = $("<table class='wgHeader' cellpadding='0' cellspacing='0'/>");
  this.wgData = $("<table class='wgData' cellpadding='0' cellspacing='0'/>");
  this.wgFooter = $("<div class='wgFooter'/>");

  // Build the content area
  this.wgContent.append(this.wgHeader);
  this.wgContent.append(this.wgData);

  // Build the frame
  Frame.append(this.wgContent);
  Frame.append(this.wgFooter);
  this.Frame = Frame;

  // Make sure the footer is visible even if it's empty
  this.wgFooter.html("&#160;");

  // Resize heights
  this.wgHeader.css("height", this.HeaderHeight + "px");
  this.wgFooter.css("height", this.FooterHeight + "px");

  var tr = $("<tr/>");
  tr.css("height", this.HeaderHeight + "px");
  this.wgHeader.append(tr);
}

WebGrid.prototype.AddColumn = function (Name, Title, Style, Ext) {
  var nColumn = this.Columns.length;

  var columnData = {
    Id: nColumn,
    Name: Name,
    Title: Title,
    Visible: true,
    Style: Style,
    IsNew: true
  };

  if (Ext)
    $.extend(columnData, Ext);

  this.Columns.push(columnData);
  this.FixLastColumn();
  
  return this;
}

WebGrid.prototype.AddRow = function (Row, NoSync) {
  var newRow = { Id: this.Rows.length, Data: Row, Style: {}, IsNew: true };
  this.Rows.push(newRow);

  if (!NoSync)
    this.SyncRows();

  return newRow;
}

WebGrid.prototype.DeleteRow = function (RowId) {
  this.Rows.splice(RowId, 1);
  this.SyncRows(1);
}

WebGrid.prototype.SyncRows = function (ForceClear) {
  if (ForceClear)
    this.wgData.empty();

  for (var iRow = 0; iRow < this.Rows.length; iRow++) {
    var Row = this.Rows[iRow].Data;
    var RowStyle = this.Rows[iRow].Style;
    if (this.Rows[iRow].IsNew || ForceClear) {
      this.Rows[iRow].IsNew = false;
      var tr = $("<tr/>");
      tr.attr("data-row", iRow);

      if (this.UsingAlternate)
        tr.css("background-color", this.LineColor[Number(iRow % 2)]);

      for (var iCol = 0; iCol < this.Columns.length; iCol++) {
        var column = this.Columns[iCol];
        var td = this.CreateCellTd(column, false, iRow, iCol);
        if (td) {
          this.CellRefValue[iCol + iRow * this.Columns.length].text(Row[column.Name] != undefined ? Row[column.Name] : "");

          if (RowStyle[iCol])
            this.ApplyCellStyle(td, RowStyle[iCol]);

          tr.append(td);

          this.CellRef[iCol + iRow * this.Columns.length] = td;
        }
        else {
          this.CellRef[iCol + iRow * this.Columns.length] = $("<div/>"); // dummy
          this.CellRefValue[iCol + iRow * this.Columns.length] = $("<div/>");
        }
      }

      this.wgData.append(tr);
    }
  }
}

WebGrid.prototype.UpdateCellTd = function (td, Column) {

  var Style = Column.Style;

  if (Column.IsLast)
    td.addClass("LastColumn");
  else td.removeClass("LastColumn");

  var width = Column.IsLast ? Style.LastWidth : Style.Width;
  if (width) { width = width + "px"; td.css({ "width": width, "min-width": width, "max-width": width }); }
  if (Style.Align) td.css("text-align", Style.Align);

  // Style not applied to header
  if (td != Column.HeaderTd)
    this.ApplyCellStyle(td, Style);
  
  return this;
}

WebGrid.prototype.CreateCellTd = function (Column, IsHeader, RowId, ColId) {
  if (!Column.Visible)
    return false;

  var td;

  if (IsHeader) {
    td = $("<td/>");
    Column.HeaderTd = td;
    td.append("<div class='wgCellBlock'><div class='wgValue'>" + Column.Title + "</div></div>");
  }
  else {
    td = $("<td data-row='" + RowId + "' data-col='" + ColId + "' data-name='" + Column.Name + "'/>");

    var cb = $("<div class='wgCellBlock'/>");
    td.append(cb);

    var div = $("<div class='wgValue'/>");
    cb.append(div);
    this.CellRefValue[ColId + RowId * this.Columns.length] = div;
  }

  this.UpdateCellTd(td, Column);

  // Events
  if (!IsHeader)
    td
    .click($.proxy(this.onCellClicked, this))
    .dblclick($.proxy(this.onCellDblClicked, this));

  return td;
}

WebGrid.prototype.SetSelection = function (td) {
  var grid = td.closest(".wgData");
  var newRow = td.data("row");
  var newCol = td.data("col");
  var InvertColor = td.closest("[data-type], .TableOfTags").data("invertcolor");
  
  if (this.SelectedCell && this.SelectedCell.Row == newRow && this.SelectedCell.Column == newCol)
    return;

  this.onSelectCell(newRow, newCol);
  if (grid.length) {
    this.SelectedCell = this.CellObject(td);
    this.SelectedRow = this.SelectedCell.Row;
    if (this.Highlight) {
      if (this.SelectionMode == "cell") {
        if(InvertColor == "yes") { // Color will invert
          $("td", grid).removeClass("wgSelectedCell");
          td.addClass("wgSelectedCell");
        }
        else { // Color will not invert
          $("td", grid).removeClass("wgSelectedCell");
        }
      }
      else {
        $("tr", grid).removeClass("wgSelectedRow");
        td.closest("tr").addClass("wgSelectedRow");
      }
    }
  }

  return this;
}

WebGrid.prototype.GetContentWidth = function (bRealSize) {
  var sum = 0;
  for (var iCol = 0; iCol < this.Columns.length; iCol++) {
    var column = this.Columns[iCol];
    if (column.Visible && column.Style) {
      var w = Number(column.Style.Width);
      if (column.IsLast && !bRealSize && column.Style.LastWidth)
        w = column.Style.LastWidth;
      sum += w;
    }
  }

  return sum;
}

WebGrid.prototype.FindColumnByName = function (Name) {
  // Return the column object that has the name Name
  for (var iCol = 0; iCol < this.Columns.length; iCol++)
    if (this.Columns[iCol].Name == Name)
      return this.Columns[iCol];

  return null;
}

WebGrid.prototype.FindColumnsByName = function (Name) {
  // Return all the columns object that have the name Name
  var result = new Array();

  for (var iCol = 0; iCol < this.Columns.length; iCol++)
    if (this.Columns[iCol].Name == Name)
      result.push(this.Columns[iCol]);

  return result;
}

WebGrid.prototype.UpdateColumns = function (Recreate) {
  var Header = $(".wgHeader", this.Frame).find("tr");

  if (Recreate) {
    // If the grid should be re-created, remove everything
    Header.empty();
    this.wgData.empty();
  }

  for (var iCol = 0; iCol < this.Columns.length; iCol++) {
    var column = this.Columns[iCol];

    // Only add the column if it's new
    if (column.IsNew || Recreate) {
      // The column isn't new anymore
      column.IsNew = false;
      column.IsModified = true;

      var td = this.CreateCellTd(column, true);
      if (td)
        Header.append(td);
    }

    // Update the column
    if (column.IsModified)
      this.UpdateCellTd(column.HeaderTd, column);

    column.IsModified = false;
  }

  // Update tables width
  $(".wgHeader,.wgData", this.Frame).css("width", (this.GetContentWidth() + 1) + "px");

  this.SyncRows(true);
  
  return this;
}

WebGrid.prototype.GetCellStyle = function (Row, Col) {
  var Column = this.Columns[Col].Name;
  var aStyle = this.Rows[Row].Style;
  if (aStyle[Column] == undefined)
    aStyle[Column] = {};
  return aStyle[Column];
}

WebGrid.prototype.SetCellStyle = function (Row, Col, Style) {
  this.Rows[Row].Style[Col] = Style;
  this.ApplyCellStyle(this.GetCellTd(Row, Col), Style);
  return this;
}

WebGrid.prototype.ApplyCellStyle = function (td, Style) {
  if (Style.Color) td.css("background-color", Style.Color);
  if (Style.FontColor) td.css("color", Style.FontColor);
}

WebGrid.prototype.RowCount = function () { return this.Rows.length; }
WebGrid.prototype.ColumnCount = function () { return this.Columns.length; }
WebGrid.prototype.GetColumnTitle = function (index) { return this.Columns[index].Title; }
WebGrid.prototype.CellObject = function (td) { return { Column: td.data("col"), Row: td.data("row"), Cell: td }; }
WebGrid.prototype.GetRow = function (Row) { return $("tr[data-row=" + Row + "]", this.Frame); }
WebGrid.prototype.GetCell = function (Row, Col) {
  var RowCount = this.Rows.length;
  while (Row >= this.Rows.length) this.AddRow({}, 1);
  if (Row >= RowCount)
    this.SyncRows();


  //var res = $(".wgValue", this.CellRef[Col + Row * this.Columns.length]);
  var res = this.CellRefValue[Col + Row * this.Columns.length];

  return res;
}
WebGrid.prototype.GetCellTd = function (Row, Col) {
  var RowCount = this.Rows.length;
  while (Row >= this.Rows.length) this.AddRow({}, 1);
  if (Row >= RowCount)
    this.SyncRows();
  return this.CellRef[Col + Row * this.Columns.length];
}
WebGrid.prototype.SetCell = function (Row, Col, Text) { var Column = this.Columns[Col].Name; this.GetCell(Row, Col).text(Text); this.Rows[Row].Data[Column] = Text; return this; }
WebGrid.prototype.SetCellHtml = function (Row, Col, Text) { var Column = this.Columns[Col].Name; this.GetCell(Row, Col).html(Text); this.Rows[Row].Data[Column] = Text; return this; }
WebGrid.prototype.UpdateCellStyle = function (Row, Col, Key, Value) { var style = this.GetCellStyle(Row, Col); style[Key] = Value; this.SetCellStyle(Row, Col, style); return this; }
WebGrid.prototype.SetCellColor = function (Row, Col, Color) { this.UpdateCellStyle(Row, Col, "Color", Color); return this; }
WebGrid.prototype.SetCellFontColor = function (Row, Col, Color) { this.UpdateCellStyle(Row, Col, "FontColor", Color); return this; }
WebGrid.prototype.SelectCell = function (Row, Col) { this.SetSelection(this.GetCellTd(Row, Col)); return this; }
WebGrid.prototype.onSelectCell = function (Row, Col) { };
WebGrid.prototype.RegisterEvent = function (event, callback) { this.Frame.on(event, callback); return this; }
WebGrid.prototype.ShowColumn = function (Name, Show) { var column = this.FindColumnByName(Name); column.Visible = Show; this.UpdateColumns(true); this.FixLastColumn(); return this; }
WebGrid.prototype.UpdateLayout = function () { $(".wgContent", this.Frame).css("height", (this.Height - this.FooterHeight) + "px"); this.FixLastColumn(); return this; }
WebGrid.prototype.onCellClicked = function (e) { var cell = $(e.target).closest("td"); this.SetSelection(cell); this.Frame.trigger("cellclicked", this.SelectedCell); return this; }
WebGrid.prototype.onCellDblClicked = function (e) { var cellTd = $(e.target).closest("td"); var cell = this.CellObject(cellTd); this.Frame.trigger("celldblclicked", cell); return this; }
WebGrid.prototype.SetBackground = function (Background) { $(".wgContent", this.Frame).css("background-color", Background); return this; }
WebGrid.prototype.SetHeaderColor = function (Color) { $(".wgHeader", this.Frame).css("background-color", Color); return this; }
WebGrid.prototype.SetFooterColor = function (Color) { $(".wgFooter", this.Frame).css("background-color", Color); return this; }
WebGrid.prototype.UseAlternate = function (IsUsing) { this.UsingAlternate = IsUsing; return this; }
WebGrid.prototype.SetLineColor = function (ColorId, Color) { this.LineColor[ColorId] = Color; return this; }

WebGrid.prototype.getFreeRow = function () {
  var rows = this.Rows;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].RowData == undefined)
      return i;
  }

  return rows.length;
}

WebGrid.prototype.findLatest = function (butEarlier, field) {
  var rows = this.Rows;
  var last = null;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].RowData != undefined) {
      var curDate = rows[i].RowData[field];
      if (curDate < butEarlier && (last == null || curDate > last.RowData[field]))
        last = rows[i];
    }
  }
  return last;
}

WebGrid.prototype.findAt = function (data, field) {
  var rows = this.Rows;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].RowData != undefined && rows[i].RowData[field] == data)
      return i;
  }

  return undefined;
}

WebGrid.prototype.FixLastColumn = function () {
  if (this.Columns.length == 0)
    return;
  var Header = $(".wgHeader", this.Frame);

  var LastColumn;
  var nCol = this.Columns.length - 1;
  while (nCol && !this.Columns[nCol].Visible)
    nCol--;

  LastColumn = this.Columns[nCol];

  // Make sure all the columns are marked as not being the last one
  for (var i = 0; i < this.Columns.length; i++) {
    this.Columns[i].IsLast = false;
    this.Columns[i].IsModified = true;
  }

  // Make the real last column as the last one
  LastColumn.IsLast = true;

  if (this.GetContentWidth(true) < this.Width) {
    // Compute missing space      
    var missingSpace = this.Width - this.GetContentWidth(true);
    LastColumn.Style.LastWidth = Number(LastColumn.Style.Width) + missingSpace;
  }
  else
    LastColumn.Style.LastWidth = Number(LastColumn.Style.Width);

  this.UpdateColumns();
}

WebGrid.prototype.Clear = function () { $(".wgData", this.Frame).empty(); this.Rows = []; return this; }

/////////////////////////////////////////////////////////////////////////////
// Footer buttons
/////////////////////////////////////////////////////////////////////////////
WebGrid.prototype.BeginFooter = function () {
  this.FooterButtons = $("<div class='footerBlock'/>");
  $(".wgFooter", this.Frame)
    .empty()
    .append(this.FooterButtons);
    
  return this;
}

WebGrid.prototype.CreateFooterButton = function () {
  var b = $("<div class='footerButton'/>");
  this.FooterButtons.append(b);
  return b;
}

WebGrid.prototype.DownloadCSV = function(ExportCsvColumnTitle) {
  var csv = "";
  var blob = undefined;
  var url = undefined;
  var link = undefined;
  
  if (ExportCsvColumnTitle == "yes") {
    for (var iCol = 0; iCol < this.ColumnCount() ; iCol++) {
      if (this.Columns[iCol].Style.HideFromCSV)
        continue;
      csv += this.GetColumnTitle(iCol);
      if (iCol < this.ColumnCount() - 1) csv += WebForms.CSVSeparator;
    }
    csv += "\n";
  }
  for (var iRow = 0; iRow < this.RowCount() ; iRow++) {
    for (var iCol = 0; iCol < this.ColumnCount() ; iCol++) {
      if (this.Columns[iCol].Style.HideFromCSV)
        continue;
      csv += this.GetCell(iRow, iCol).text();
      if (iCol < this.ColumnCount() - 1) csv += WebForms.CSVSeparator;
    }
    csv += "\n";
  }
  
  // Make link to download
  link = document.createElement("a");
  blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", "data.csv");
  link.style = "visibility:hidden";
      
  if (navigator.msSaveBlob) { // IE 10+
    link.addEventListener("click", function (event) {
    var blob = new Blob([csv], {
      "type": "text/csv;charset=utf-8;"
    });
      navigator.msSaveBlob(blob, "data.csv");
    }, false);
  }
  
  // Perform download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

WebGrid.prototype.ShowCSV = function (ExportCsvColumnTitle) {
  var dlg = new InputDialog("csvDlg", "CSV");
  var that = this;
  dlg.AddLabel("", "Copy the following text");
  dlg.AddTextArea("csv", 670, 200);
  dlg.LineBreak();
  dlg.AddButton("Select all", function () { this.GetItem("#csv").select(); });
  dlg.CloseOnEscape = true;

  var csv = "";
  if (ExportCsvColumnTitle == "yes") {
    for (var iCol = 0; iCol < this.ColumnCount() ; iCol++) {
      if (this.Columns[iCol].Style.HideFromCSV)
        continue;
      csv += this.GetColumnTitle(iCol);
      if (iCol < this.ColumnCount() - 1) csv += WebForms.CSVSeparator;
    }
    csv += "\n";
  }
  for (var iRow = 0; iRow < this.RowCount() ; iRow++) {
    for (var iCol = 0; iCol < this.ColumnCount() ; iCol++) {
      if (this.Columns[iCol].Style.HideFromCSV)
        continue;
      csv += this.GetCell(iRow, iCol).text();
      if (iCol < this.ColumnCount() - 1) csv += WebForms.CSVSeparator;
    }
    csv += "\n";
  }

  var ta = dlg.GetItem("#csv");
  ta.text(csv);

  dlg.Show();
}

WebGrid.prototype.SetHeaderFont = function (font) { this.wgHeader.css("font-family", font); return this; }
WebGrid.prototype.SetHeaderFontSize = function (size) { this.wgHeader.css("font-size", size + "px"); return this; }
WebGrid.prototype.SetContentFont = function (font) { this.wgData.css("font-family", font); return this; }
WebGrid.prototype.SetContentSize = function (size) { this.wgData.css("font-size", size + "px"); return this; }
