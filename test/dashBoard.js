$(document).ready(function(){
  var URL = "https://iris-vip.paypalinc.com/api/v1/status/?type=host&jsoncallback=?";
  var chartArray = new Array(); 
  var daysText = "d";
  var hoursText = "hr";
  var minutesText = "min";
  var secondsText = "sec";
  var percentText = ":";
  var TRAFFIC_ENABLED = "TrafficEnabled";
  var TRAFFIC_DISABLED = "TrafficDisabled";
  var STYLE_GREEN = " style='color:green;'";
  var STYLE_RED = " style='color:red;'";
  var STYLE_ORANGE = " style='color:orange;'";
  var refreshTime = 16000;
  var UI = " ui";
  var SERVER = " server";
  var PROXY = " proxy";
  var PROXYUI = " proxy, ui";
  var COLOR, roles, timer, server, timeStamp, date, dateYear, dateMonth, dateDay, dateHour, dateMin, lastCheckInSec, delta, days, hours, minutes, seconds, totalTime, currentTime, captionName;
  function getChartInfo() {
    var newDataSource = {
        "chart": {
        "caption": captionName + ":" + roles,
        "subcaption": "Last checkin:" + "<br />" + lastTime + "<br />" + "(" + dateMonth + "/" + dateDay + "/" + dateYear +  "  " + dateHour + ":" + dateMin + ")",
        "subcaptionFontBold": "1",
        "lowerLimit": "0",
        "upperLimit": "3",
        "lowerLimitDisplay": "0 min",
        "upperLimitDisplay": "",
        "numberSuffix": " min",
        "showValue": "0",
        "showhovereffect": "1",
        "bgCOlor": "#ffffff",
        "borderAlpha": "1",
        "cylFillColor": COLOR
    },
    "value": totalTime
    };   
    return newDataSource;
  }
  function dateCalculation() {
    currentTime = Math.floor(Date.now() / 1000);
    timeStamp = server.ts;                    
    date = new Date(timeStamp * 1000);
    dateYear = date.getFullYear();
    dateMonth = date.getMonth()+1;
    dateDay = date.getDate();
    dateHour = date.getHours();
    dateMin = date.getMinutes();
    lastCheckInSec = date.getSeconds() + date.getMinutes() * 60 + date.getHours() * 3600;
    delta = currentTime - timeStamp;
    days = Math.floor(delta / 86400);
    delta -= days * 86400; 
    hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    seconds = delta % 60;
    totalTime = days * 24 * 3600 + hours * 3600 + minutes * 60 + seconds;
    totalTime /= 60;
  }
  function setLastTime() {
    var lastTime;
    if(days == 0 && hours == 0 && minutes == 0) {
        lastTime = seconds + secondsText; 
    }else if(days == 0 && hours == 0) {
        lastTime = minutes + minutesText +  percentText + seconds + secondsText; 
    }else if(days == 0) {
        lastTime = hours + hoursText + percentText + minutes  + minutesText + percentText + seconds + secondsText; 
    }else {
        lastTime = days + daysText + percentText + hours + hoursText + percentText + minutes  + minutesText + percentText + seconds + secondsText;
    }
    return lastTime;
  }
  function setCaption(totalTime, dateHour, dateMin) {
    if(totalTime <= 3) {
        COLOR = "#008ee4";
    }else {
        COLOR = "#FF0000";
    }
    if(dateHour > 12) {
        dateHour = dateHour - 12;
        dateMin += "PM";
    } else {
        dateMin += "AM";
    }
  }
  function setRoles(role) {
    var ui = false;
    var server = false;
    var proxy = false;  
    if(role.ui == true) {
    ui = true;
    }
    if(role.proxy == true) {
    proxy = true;
    }
    if(role.server == true) {
    server = true;
    }
    if(ui == true && server == false && proxy == false) {
        role = UI;
    }
    if(server == true && ui == false && proxy == false) {
        role = SERVER;
    }
    if(proxy == true && ui == false && server == false) {
        role = PROXY;
    }
    if(proxy == true && ui == true && server == false) {
        role = PROXYUI;
    }
    return role;
  }
  function main(clicked) {
  $.getJSON(URL, function mycallback(data) {
                  chartArray = new Array();
                  var flag = 1;
                  var arr = new Array();
                  var numberArray = new Array();
                  var myArr = data.data;   
                  if(clicked == "all") {
                    arr = myArr;
                  }else {
                    for(var i = 0; i < myArr.length; i++) {
                      if(myArr[i].json.roles[clicked] == true) {
                        var obj = new Object();
                        obj[i] = myArr[i];
                        arr.push(myArr[i]);
                        numberArray.push(i);                               
                      }
                      flag = 2;                          
                    }
                  }
                  for(var i = 0; i < arr.length; i++) {
                      var div = document.createElement("svg");
                      div.style.width = "300px";
                      div.style.height = "300px";
                      div.style.color = "white";
                      if(flag == 1) {
                        div.setAttribute("id", "container" + i);
                      }else {
                        div.setAttribute("id", "container" + numberArray[i]);
                      }                         
                      div.setAttribute("class", "col-md-1");
                      div.onclick = function(){
                          var clickedId = $(this).attr("id");
                          var serverNumber;
                          if(clickedId.length == 10) {
                              serverNumber = clickedId.charAt(9);
                          } else {
                              serverNumber = clickedId.substring(9,11);
                          } 
                          $.getJSON(URL, function mycallback(data) {
                                  var jsonObjectArr = data.data;
                                  var server = jsonObjectArr[serverNumber];
                                  var jsonInfo = server.json;
                                  var gauges = [];
                                  function createGauge(name, label, minValue, maxValue, min, max, direction) {
                                      var config = 
                                      {
                                        size: 160,
                                        label: label,
                                         min: undefined != min ? min : 0,
                                         max: undefined != max ? max : 100,
                                        minorTicks: 20
                                      }
                                      if(direction == 0) {
                                        config.yellowZones = [{ from: minValue, to: maxValue }];
                                        config.redZones = [{ from: 0 , to: minValue }]; 
                                      } else {
                                        config.yellowZones = [{ from: minValue, to: maxValue }];
                                        config.redZones = [{ from: maxValue , to: max }];
                                      }   
                                      gauges[name] = new Gauge(name + "GaugeContainer", config);
                                      gauges[name].render();  
                                  }
                                  function createGauges() {
                                      createGauge("diskspace_free_percent", "FreeDiskSpace%", 5, 10, 0, 100, 0);
                                      createGauge("free_memory", "FreeMemoryGB", 10000000, 20000000, 0, 67108864, 0);
                                      createGauge("CPULoad", "CPULoad%", 80, 90, 0, 100, 1);
                                      createGauge("opchache_hit_rate", "opcache_hit_rate%", 30, 50, 0, 100, 0);
                                  }
                                  function updateGauges()
                                  {                                            
                                      var diskspace_free_percent = (jsonObjectArr[serverNumber].json.diskspace_free_percent);
                                      var free_memory = (jsonObjectArr[serverNumber].json.opcache.memory_usage.free_memory);
                                      var opchache_hit_rate = (jsonObjectArr[serverNumber].json.opcache.opcache_statistics.opcache_hit_rate);
                                      gauges['diskspace_free_percent'].redraw(diskspace_free_percent);
                                      gauges['free_memory'].redraw(free_memory);
                                      gauges['opchache_hit_rate'].redraw(opchache_hit_rate);
                                      if(jsonObjectArr[serverNumber].json.apache != null) {
                                        var CPULoad = (jsonObjectArr[serverNumber].json.apache.CPULoad);
                                        gauges['CPULoad'].redraw(CPULoad * 100);
                                      }
                                      roles = jsonObjectArr[serverNumber].json.roles;
                                      ui = false;
                                      server = false;
                                      proxy = false;       
                                      if(roles.ui == true) {
                                        ui = true;
                                      }
                                      if(roles.proxy == true) {
                                        proxy = true;
                                      }
                                      if(roles.server == true) {
                                        server = true;
                                      }
                                      var add ;                           
                                      var dbLatency;
                                      var connected;
                                      var uptime = jsonObjectArr[serverNumber].json.uptime;
                                      var traffic;
                                      var deferred_count;      
                                      var trafficStyle;
                                      var connectedStyle;
                                      var dbLatencyStyle;
                                      var deferred_countStyle;
                                      var modalFooter;
                                      var counter;
                                      days = Math.floor(uptime / 86400);
                                      uptime -= days * 86400; 
                                      hours = Math.floor(uptime / 3600) % 24;
                                      uptime -= hours * 3600;
                                      minutes = Math.floor(uptime / 60) % 60;
                                      uptime -= minutes * 60;
                                      seconds = Math.floor(uptime % 60);
                                      uptime = days + daysText + hours + hoursText + minutes + minutesText + seconds + secondsText; 
                                      if(ui == true && server == false && proxy == false) { 
                                         dbLatency  = jsonObjectArr[serverNumber].json.db.latency;
                                         connected = jsonObjectArr[serverNumber].json.db.connected;
                                         traffic = jsonObjectArr[serverNumber].json.traffic;
                                         if(traffic == TRAFFIC_ENABLED) {                          
                                          trafficStyle = STYLE_GREEN;  
                                         }
                                         if(traffic == TRAFFIC_DISABLED) {
                                          trafficStyle = STYLE_RED;  
                                         }
                                         if(connected == true) {
                                          connectedStyle = STYLE_GREEN; 
                                         }
                                         if(connected == false) {
                                          connectedStyle = STYLE_RED; 
                                         }
                                         if(dbLatency < 0.1) {
                                          dbLatencyStyle = STYLE_GREEN;
                                         }
                                         if(dbLatency >= 0.1 && dbLatency < 0.5) {
                                          dbLatencyStyle = STYLE_ORANGE;
                                         }
                                         if(dbLatency >= 0.5) {
                                          dbLatencyStyle = STYLE_RED;
                                         }      
                                         add = "<table cellspacing='20' cellpadding='0' alien='center'><tr><th> dbLatency </th><th> connected </th><th> uptime </th><th>Traffic</th></tr>";
                                         add += "<tr><td" + dbLatencyStyle + ">" + dbLatency + "</td><td" + connectedStyle + ">" + connected + "</td><td>" + uptime + "</td><td" + trafficStyle + ">" + traffic + "</td></tr></table>";
                                         modalFooter = "ui";
                                      }
                                      if(server== true && ui == false && proxy == false) {
                                          dbLatency  = jsonObjectArr[serverNumber].json.db.latency;
                                          traffic = jsonObjectArr[serverNumber].json.traffic;
                                          if(traffic == TRAFFIC_ENABLED) {
                                            trafficStyle = STYLE_GREEN;  
                                          }
                                          if(traffic == TRAFFIC_DISABLED) {
                                            trafficStyle = STYLE_RED;  
                                          }
                                          if(dbLatency < 0.1) {
                                            dbLatencyStyle = STYLE_GREEN;
                                          }
                                          if(dbLatency >= 0.1 && dbLatency < 0.5) {
                                            dbLatencyStyle = STYLE_ORANGE;
                                          }
                                          if(dbLatency >= 0.5) {
                                            dbLatencyStyle = STYLE_RED;
                                          }
                                          add = "<table cellspacing='20' cellpadding='0' alien='center'><tr><th> dbLatency </th><th> uptime </th><th>Traffic</th></tr>";
                                          add += "<tr><td" + dbLatencyStyle + ">" + dbLatency + "</td><td>" + uptime + "</td><td" + trafficStyle + ">" + traffic + "</td></tr></table>";
                                          modalFooter = "server";
                                      }
                                      if(proxy == true && ui == false && server == false) {
                                          traffic = jsonObjectArr[serverNumber].json.traffic;
                                          deferred_count = jsonObjectArr[serverNumber].json.deferred_count;
                                          var central_servers = jsonObjectArr[serverNumber].json.central_servers;
                                          if(traffic == TRAFFIC_ENABLED) {
                                            trafficStyle = STYLE_GREEN;  
                                          }
                                          if(traffic == TRAFFIC_DISABLED) {
                                            trafficStyle = STYLE_RED;  
                                          }
                                          if(deferred_count >= 0 && deferred_count < 10) {
                                            deferred_countStyle = STYLE_GREEN; 
                                          }
                                          if(deferred_count >= 10 && deferred_count < 25) {
                                            deferred_countStyle = STYLE_ORANGE; 
                                          }
                                          if(deferred_count >= 25) {
                                            deferred_countStyle = STYLE_RED; 
                                          }
                                          var connectStyleArr = new Array();
                                          for(var key in central_servers) {
                                              if(central_servers[key].connected == true) {
                                                  connectStyleArr.push(STYLE_GREEN);
                                              } else {
                                                  connectStyleArr.push(STYLE_RED);
                                              }
                                          }
                                          var latencyArr = new Array();                                                           
                                          for(var key in central_servers) {
                                              var value = central_servers[key].latency;
                                              if(value < 0.1) {
                                                  latencyArr.push(STYLE_GREEN);
                                              } else if(value >= 0.1 && value < 0.5 ) {
                                                  latencyArr.push(STYLE_ORANGE);
                                              } else {
                                                  latencyArr.push(STYLE_RED);
                                              }
                                          }
                                          add = "<table cellspacing='20' cellpadding='0' alien='center'><tr><th> uptime </th><th>Traffic</th><th>deferred_count</th><th>link</th><th>connected</th><th>latency</th></tr>";    
                                          counter = 0;                         
                                          for(var key in central_servers) {
                                              add += "<tr><td>" + uptime + "</td><td" + trafficStyle + ">" + traffic + "</td><td" + deferred_countStyle + ">" + deferred_count + "</td><td>"+ key + "</td><td" + connectStyleArr[counter] + ">" +
                                              central_servers[key].connected  + "</td><td" + latencyArr[counter] + ">" + central_servers[key].latency + "</td></tr>";
                                          }
                                          counter++;
                                          add += "</table>";
                                          modalFooter = "proxy";
                                      }
                                      if(proxy== true && ui == true && server == false) {
                                          dbLatency  = jsonObjectArr[serverNumber].json.db.latency;
                                          traffic = jsonObjectArr[serverNumber].json.traffic;
                                          connected = jsonObjectArr[serverNumber].json.db.connected;
                                          deferred_count = jsonObjectArr[serverNumber].json.deferred_count;
                                          var central_servers = jsonObjectArr[serverNumber].json.central_servers;
                                          if(connected == true) {
                                            connectedStyle = STYLE_GREEN; 
                                          }
                                          if(connected == false) {
                                            connectedStyle = STYLE_RED; 
                                          }                                                           
                                          if(traffic == TRAFFIC_ENABLED) {
                                            trafficStyle = STYLE_GREEN;  
                                          }
                                          if(traffic == TRAFFIC_DISABLED) {
                                            trafficStyle = STYLE_RED;  
                                          }
                                          if(deferred_count >= 0 && deferred_count < 10) {
                                            deferred_countStyle = STYLE_GREEN; 
                                          }
                                          if(deferred_count >= 10 && deferred_count < 25) {
                                            deferred_countStyle = STYLE_ORANGE; 
                                          }
                                          if(deferred_count >= 25) {
                                            deferred_countStyle = STYLE_RED; 
                                          }
                                          if(dbLatency < 0.1) {
                                            dbLatencyStyle = STYLE_GREEN;
                                          }
                                          if(dbLatency >= 0.1 && dbLatency < 0.5) {
                                            dbLatencyStyle = STYLE_ORANGE;
                                          }
                                          if(dbLatency >= 0.5) {
                                            dbLatencyStyle = STYLE_RED;
                                          }
                                          var connectStyleArr = new Array();
                                          for(var key in central_servers) {
                                              if(central_servers[key].connected == true) {  
                                                  connectStyleArr.push(STYLE_GREEN);
                                              } else {
                                                  connectStyleArr.push(STYLE_RED);
                                              }
                                          }
                                          var latencyArr = new Array();                                                       
                                          for(var key in central_servers) {
                                              var value = central_servers[key].latency;
                                              if(value < 0.1) {
                                                  latencyArr.push(STYLE_GREEN);
                                              } else if(value >= 0.1 && value < 0.5 ) {
                                                  latencyArr.push(STYLE_ORANGE);
                                              } else {
                                                  latencyArr.push(STYLE_RED);
                                              }
                                          }
                                          add = "<table cellspacing='20' cellpadding='0' alien='center'><tr><th> uptime </th><th>Traffic</th><th>deferred_count</th><th>link</th><th>connected</th><th>latency</th><th>dbLatency</th><th>dbConnected</th></tr>"; 
                                          counter = 0;
                                          for(var key in central_servers) {                     
                                              add += "<tr><td>" + uptime + "</td><td" + trafficStyle + ">" + traffic + "</td><td" + deferred_countStyle + ">" + deferred_count + "</td><td>"+ key + "</td><td" + connectStyleArr[counter] + ">" + 
                                              central_servers[key].connected  + "</td><td" + latencyArr[counter] + ">" + central_servers[key].latency + "</td><td" + dbLatencyStyle + ">" + dbLatency + "</td><td" + connectedStyle + ">" + connected + "</td></tr>";
                                              counter++;
                                          }
                                          add += "</table>";
                                          modalFooter = "ui, proxy";
                                    }
                                    var modalHeader = "<h3 style='float: left'>" + jsonObjectArr[serverNumber].name + "</h3>" + "<h3 style='float: right'>" +
                                    "Role(s): " + modalFooter + "</h3>";
                                    $('.modal-table').html(add);
                                    $('.title').html(modalHeader); 
                                  }
                                  function initialize() {
                                    createGauges();
                                    updateGauges();
                                  }
                                  function modalCallURL() {
                                    var gaugeStyle = "GaugeContainer' style='padding-left: 5%;'></span>";
                                    var diskspace_free_percent_Name = 'diskspace_free_percent';
                                    var diskspace_free_percent_input = "<span id='" + diskspace_free_percent_Name + gaugeStyle;
                                    var free_memory_Name = 'free_memory';
                                    var free_memory_input = "<span id='" + free_memory_Name + gaugeStyle;
                                    var CPULoad_Name = 'CPULoad';
                                    var CPULoad_input = "<span id='" + CPULoad_Name + gaugeStyle;
                                    var opchache_hit_rate_Name = 'opchache_hit_rate';
                                    var opchache_hit_rate_input = "<span id='" + opchache_hit_rate_Name + gaugeStyle;
                                    var space = "";
                                    $('.modal-body').html(diskspace_free_percent_input + space + free_memory_input  + space + CPULoad_input + space + opchache_hit_rate_input);
                                    initialize();
                                    modal.style.display = "block";
                                  }
                                  modalCallURL();
                              });
                      };
                      document.getElementById('mainDashboard').appendChild(div);
                  }  
                  for(var i = 0; i < arr.length; i++) {
                            server = arr[i];
                            dateCalculation();
                            lastTime = setLastTime();
                            roles = arr[i].json.roles;
                            roles = setRoles(roles);
                            setCaption(totalTime, dateHour, dateMin);  
                            captionName = arr[i].name;
                            var mydataSource = getChartInfo();
                            var idNumber;
                            var renderAtNumber;
                            if(flag == 1) {
                              idNumber = 'fuelMeter' + i;
                              renderAtNumber = 'container' + i;
                            }else {
                              idNumber = 'fuelMeter' + numberArray[i];
                              renderAtNumber = 'container' + numberArray[i];
                            }
                            var salesByBrandChart = new FusionCharts({
                                type: 'cylinder',
                                dataFormat: 'json',
                                id: idNumber,
                                renderAt: renderAtNumber,
                                cursor: 'hand',
                                width: '200',
                                height: '250',
                                class: 'chart',
                                dataSource: mydataSource
                            }).render();
                            chartArray.push(salesByBrandChart);                      
                      }       
                      timer = setInterval(function(){ 
                           $.getJSON(URL, function mycallback(dataFile) {
                                      var myData = dataFile.data;                               
                                      for(var j = 0; j < chartArray.length; j++) {
                                              if(flag == 1) {
                                                server = myData[j];
                                              }else {
                                                server = myData[numberArray[j]];
                                              }                            
                                              dateCalculation();
                                              lastTime = setLastTime();
                                              if(flag == 1) {
                                                roles = myData[j].json.roles;
                                              }else {
                                                roles = myData[numberArray[j]].json.roles;
                                              }                             
                                              roles = setRoles(roles);
                                              setCaption(totalTime, COLOR, dateHour, dateMin);
                                              if(flag == 1) {
                                                captionName = myData[j].name;
                                              }else {
                                                captionName = myData[numberArray[j]].name;
                                              }
                                          var newDataSource = getChartInfo();     
                                          chartArray[j].setChartData(newDataSource, "json");
                                      }
                                  });
                      }, refreshTime);      
    });
  }
    main("all");
    $(".nav-tabs a").click(function(){
        $(this).tab('show');    
    });
    $('.nav-tabs a').on('shown.bs.tab', function(event){
       clearTimeout(timer);
       $('#mainDashboard').empty();
        var x = $(event.target).text();         // active tab
        if(chartArray.length > 1) {
          for(var i = 0; i < chartArray.length; i++) {
            chartArray[i].dispose();
          }
        }
        chartArray = new Array();
        main(x);    
    });
});