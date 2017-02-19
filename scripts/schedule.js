$(function () {
    InitPage();
});

function InitPage(){
  $("#startDemo").on("click",function(){
    $("#intro").remove();
    $("#main").show();
  });

  $("#dialog").dialog({
    autoOpen: false,
    height: 430,
    width: 410,
    buttons: {
      Close: function() {
        $(this).dialog( "close" );
      }
    },
    close: function() {
      $(this).find("div.f8").hide();
    }

  });
  $( ".selectable" ).selectable({
    filter: "li:not(.unselectable)",
    cancel: "li.unselectable",
    start: function(){
      $(".ui-selected").removeClass("ui-selected");
    },
    stop: function(){
      SelectTime();
      prev = -1;
    },
    selecting: function(e, ui) {
      var curr = $(ui.selecting.tagName, e.target).index(ui.selecting);
      if(prev > -1 && Math.abs(curr - prev) > 1){
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            $(ui.selecting).removeClass("ui-selecting");
            return false;
      } else {
          prev = curr;
      }
    }
  });
  $( "#datepicker" ).datepicker({
    changeMonth: true,
    changeYear: true,
    minDate: 0,
    onSelect: function(dateText){
      SelectDate(dateText);
    },
    beforeShowDay: function(date) {
      if (ThisWeek(date)) {
        return [true, "this-week", "When requesting a room less than a week in advance, you must call the library."];
      } else {
        return [true, ""];
      }
    }
  });
  $(".button").button().hide().on("click",function(){
    $("#main").hide();
    $("#confirmation").show();
  });

  $("#rooms .room").on("click", "span.info",function(){
    var obj = $("#dialog");
    var dID = "#d" + this.id;
    if(obj.dialog("isOpen")){
      if($(dID).filter(":visible").length)
        obj.dialog("close");
      else{
        obj.find("div.f8").hide();
        $(dID).show();
      }    
    }else{
      obj.dialog("open");
      $(dID).show();
    }
  });
}

var prev = -1;
var availableTimes = [];
var daysOfWeek = ["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"];

function GetLI(label, c, thisWeek, i){
  var props = (typeof(i) != "undefined" ? ("id='" + i + "'") : "");
  var cl = "unselectable ";
  if(label.toLowerCase() === "open"){
    if(thisWeek){
      props += " style='box-shadow: unset;'";
      label = "please call to reserve";
      cl += "please-call"
    }
    else
      cl = "";
  }
  
  
  return "<li " + props + " class='" + cl + c + "'>" + label +"</li>";
}

function SelectDate(dateText){
  $("#rooms").show();
  $("#key").show();
  var sDate = new Date(dateText);
  var thisWeek = ThisWeek(sDate);
  var day = sDate.getDay();
  var dayMod = day%2;
  var lists = [$("#timeList"),$("#room1"),$("#room2")];
  availableTimes = [];
  var openTime = "";
  var closingTime = "";

  $("#rooms ul").html("");
  $("#selectedDate").html("Availability for: " + dateText);
  $("#selectedSlot").html("");
  $("div.selected").removeClass("selected");
  $("#continue").hide();

  var x =0;
  times.forEach(function(t){
    if(t.days.indexOf(day) > -1){
      var c = (t.beforeOpen.indexOf(day) > -1 ? "beforeOpen" : (t.afterClose.indexOf(day) > -1 ? "afterClose" : ""));

      if(!openTime.length && !c.length)
        openTime = t.startTime;
      else if(!c.length)
        closingTime = t.startTime;

      var tm = t.startTime + " - " + t.endTime;
      lists[0].append(GetLI(tm, c));
      lists[1].append(GetLI(t.cr[dayMod], c, thisWeek, "cr_" + x));
      lists[2].append(GetLI(t.mr[dayMod], c, thisWeek, "mr_" + x));
      availableTimes.push(t);
      x++;
    }
  });

  $("#key div.afterClose").html("Reservations cannot start after the library closes at " + closingTime + " on " + daysOfWeek[day]);
  $("#key div.beforeOpen").html("For reservations starting before the library opens at " + openTime + ", you must call in advance to gain access to the building");
  if(thisWeek)
    $("#note").show();
  else
    $("#note").hide();

}

function SelectTime(){
  var selectedTimes = [];
  var selectedType = "";
  var cOpen = 0;
  var cClosed = 0;
  var cEarly = 0;
  $(".ui-selected").each(function(){
    var tmp = this.id.split("_");
    selectedType = tmp[0];
    selectedTimes.push(availableTimes[tmp[1]]);
    if($(this).hasClass("afterClose"))
      cClosed++;
    else{
      cOpen++;
      if($(this).hasClass("beforeOpen"))
        cEarly++;
    }
  });

  $("#selectedSlot").html("");
  $(".emphasize").removeClass("emphasize");
  $("div.selected").removeClass("selected");
  if(cClosed > 0 && cOpen == 0){
    $(".ui-selected").removeClass("ui-selected");
    $("#key div.afterClose").effect("shake",1000).addClass("emphasize");
    $("#continue").hide();
  }else{
    var i = selectedTimes.length - 1;
    var sTime = "Selected time slot: " + selectedTimes[0].startTime + " - " + selectedTimes[i].endTime;
    $("#selectedSlot").html(sTime);
    $("#continue").show();
    $("#rooms > div:has(li.ui-selected)").find("div.room").addClass("selected");
    if(cEarly > 0)
      $("#key div.beforeOpen").effect("pulsate",1000).addClass("emphasize");
  }
}

function ThisWeek(date)
{
  var dNow = new Date();
  if (date.getDate() < dNow.getDate()) {
    return false;
  }
  dNow.setDate(dNow.getDate() + 7);
  return (date < dNow);
}
