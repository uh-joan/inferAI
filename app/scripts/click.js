(function(window, document) {
  'use strict';

  var LEFT, MIDDLE, RIGHT, timeStamp;
  LEFT = 0;
  MIDDLE = 1;
  RIGHT = 2;
  timeStamp = 0;
  var newDiv;
  var mt;
  var m;
  //var speed;
  var distanceTraveled;
  var totalMmTraveled=0;
  var avgSpeed=0;
  var totalClicks=0;
  var totalScrolled=0;
  //var totalDrags=0;
  var PX2MM = 0.2645833333333;

  var jQuery, $; // Localize jQuery variables

  var mrefreshinterval = 1000; // update display every sec
  var lastmousex=-1;
  var lastmousey=-1;
  var lastmousetime;
  var mousetravel = 0;
  var mpoints = [];
  var mpoints_max = 30;

  var mouseWheel = false;
  var key;
  var word = '';

  //var _baseUrl = 'http://www.apicake.io/';
  var _baseUrl = 'https://01ef2ba2.ngrok.io/infer/data';
  //var _baseUrl = 'https://localhost:3000/infer/data';

  var dt= new Date();
  var log_value ={
    url: '' ,
    distance_mm: 0,
    distance_px: 0,
    speed: 0,
    wheel: {
      delta_up: 0,
      delta_down: 0,
      deltaX_east: 0,
      deltaX_west: 0,
      deltaY_north: 0,
      deltaY_south:0,
      pageX: 0,
      pageY: 0
    },
    scroll: {
      up: 0,
      down: 0
    },
    keys: '',
    start: dt.toLocaleString(),
    end: 0
  };

  function logger(value, label1, label2){

    if (typeof(label2)==='undefined'){
      if (label1==='speed'){
        log_value[label1] = (log_value[label1]+value)/2;
      } else
        log_value[label1]+=value;
    } else {
      if (label2==='scroll'){
          log_value[label2][label1] = Math.max(log_value[label2][label1], value);
      } else if(label1==='pageX' || label1==='pageY'){
        log_value[label2][label1] = value;
      }else
        log_value[label2][label1]+=value;
    }
  }

  var _getInferUrl = function(){
    return encodeURI(_baseUrl);
  };

  var _stats = function(data){
    var request = new XMLHttpRequest();
    request.open('POST', _getInferUrl());
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
      if (request.status === 200) {
        var response = JSON.parse(request.responseText);
        //console.log('response: '+ JSON.stringify(response));

      }
      else if (request.status !== 200) {
        console.log('Request failed.  Returned status of ' + request.status + '.');
        console.log(request.responseText);
      }
      //setTimeout(_stats, 60000);
    };
    request.send(data);
  };

  //setInterval(function(){
  //  create_log();
  //}, 5000);

  function create_log(){

    dt= new Date();
    var timenow = dt.toLocaleString();
    log_value.end = timenow;
    log_value.url = window.location.href;
    _stats(JSON.stringify(log_value));
    //console.log('log: ' + JSON.stringify(log_value));

    log_value ={
      url: '',
      distance_mm: 0,
      distance_px: 0,
      speed: 0,
      wheel: {
        delta_up: 0,
        delta_down: 0,
        deltaX_east: 0,
        deltaX_west: 0,
        deltaY_north: 0,
        deltaY_south:0,
        pageX: 0,
        pageY: 0
      },
      scroll: {
        up: 0,
        down: 0
      },
      keys: '',
      start: timenow,
      end: 0
    };
  }

  function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
  }

  loadScript('https://cdn.rawgit.com/BusfyJan/MouseTracker/master/src/mouseTracker.js', function(){
    mt = MouseTracker({
      //configuration(optional)
      remember_user: true,
      distanceUnits: 'mm' //['mm', 'inch']
      //onDistanceChanged: function(distance, gain){
      //  console.log('onDistanceChanged: ' + distance + ' - ' + gain);
      //}
    });
  });

  loadScript('https://cdn.rawgit.com/monospaced/hamster.js/master/hamster.js', function(){
    Hamster(document.body).wheel(function(event, delta, deltaX, deltaY){
      mouseWheel = true;
      var o = '';
      if (delta > 0) {
        o = 'Wheel: up ('+delta+')';
        logger(delta, 'delta_up', 'wheel');
      } else if (delta < 0) {
        o = 'Wheel: down ('+delta+')';
        logger(delta, 'delta_down', 'wheel');
      }

      if (deltaX > 0) {
        o = o + ', east ('+deltaX+')';
        logger(deltaX, 'deltaX_east', 'wheel');
        totalScrolled+=deltaX;
      } else if (deltaX < 0) {
        o = o + ', west ('+deltaX+')';
        logger(deltaX, 'deltaX_west', 'wheel');
        totalScrolled+=Math.abs(deltaX);
      }
      if (deltaY > 0) {
        o = o + ', north ('+deltaY+')';
        logger(deltaY, 'deltaY_north', 'wheel');
        totalScrolled+=deltaY;
      } else if (deltaY < 0) {
        o = o + ', south ('+deltaY+')';
        logger(deltaY, 'deltaY_south', 'wheel');
        totalScrolled+=Math.abs(deltaY);
      }
      //console.log(o);
      if (o != '') {
        var wheel_el = document.getElementById('wheelDirection');
        wheel_el.innerHTML = o;
      }

      //totalScrolled+=log_value.wheel.delta_up;
      //totalScrolled+=log_value.wheel.delta_down;
      //totalScrolled=Math.abs(log_value.wheel.deltaX_east)+Math.abs(log_value.wheel.deltaX_west)+Math.abs(log_value.wheel.deltaY_north)+Math.abs(log_value.wheel.deltaY_south);
      var wheelScrolled_el = document.getElementById('wheelScrolled');
      wheelScrolled_el.innerHTML = 'Wheel total: ' + (totalScrolled*PX2MM).toFixed(0) + ' mm';

      var pageX = event.pageX || event.originalEvent.pageX || event.originalEvent.clientX,
        pageY = event.pageY || event.originalEvent.pageY || event.originalEvent.clientX;
      var pagexy_el = document.getElementById('pageXYDirection');
      pagexy_el.innerHTML = 'Page X: ' + pageX + ', Y: ' + pageY;

      logger(pageX, 'pageX', 'wheel');
      logger(pageY, 'pageY', 'wheel');

    });
    var lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    document.addEventListener('scroll', function (e) {

      if (!mouseWheel) {
        var st = window.pageYOffset || document.documentElement.scrollTop;
        var scroll_el = document.getElementById('scrollDirection');
        if (st > lastScrollTop){
            scroll_el.innerHTML = 'Scroll direction: down, Y: ' + window.pageYOffset;
            logger( window.pageYOffset, 'down', 'scroll');
          } else {
            scroll_el.innerHTML = 'Scroll direction: up  , Y: ' + window.pageYOffset;
            logger( window.pageYOffset, 'up', 'scroll');
        }
          lastScrollTop = st;
      }
      mouseWheel = false;
    });
  });

  //https://raw.githubusercontent.com/Benvie/Mouse/master/Mouse.js
  loadScript('https://cdn.rawgit.com/Benvie/Mouse/master/Mouse.js', function(){
  //  console.log('mouse loaded');
    m = mouse;


    m.on('move', function(e){
      // prevent default text selection
      //e.preventDefault();
      var mousex = this.x;
      var mousey = this.y;
      if (lastmousex > -1) {
        mousetravel += Math.max( Math.abs(mousex-lastmousex), Math.abs(mousey-lastmousey) );
      }
      lastmousex = mousex;
      lastmousey = mousey;
      //console.log('mousetravel: ' + mousetravel);
    });

    var mdraw = function() {
      var md = new Date();
      var timenow = md.getTime();
      if (lastmousetime && lastmousetime!=timenow) {
        var pps = Math.round(mousetravel / (timenow - lastmousetime) * 1000);
        mpoints.push(pps);
        if (mpoints.length > mpoints_max)
          mpoints.splice(0,1);
        mousetravel = 0;
        distanceTraveled=mt.getDistanceTraveled();
        totalMmTraveled+=distanceTraveled;
        //console.log(distanceTraveled + ' px ' + mpoints[mpoints.length-1] + ' pps');
        var distanceTraveled_el = document.getElementById('distanceTraveled');
        distanceTraveled_el.innerHTML = 'mm: ' + distanceTraveled.toFixed(0);
        logger(distanceTraveled, 'distance_mm');
        var totalMm_el = document.getElementById('totalMm');
        totalMm_el.innerHTML = 'total: ' + totalMmTraveled.toFixed(0) + ' mm';
        var pixelsTraveled_el = document.getElementById('pixelsTraveled');
        pixelsTraveled_el.innerHTML = 'px: ' + mpoints[mpoints.length-1];
        logger(mpoints[mpoints.length-1], 'distance_px');
      }
      mt.clearDistanceTraveled();
      lastmousetime = timenow;
      setTimeout(mdraw, mrefreshinterval);
    };
    // We could use setInterval instead, but I prefer to do it this way
    setTimeout(mdraw, mrefreshinterval);


    m.on('up', 'left', function(e){
      //e.preventDefault();
      totalClicks+=1;
      var clicks_el = document.getElementById('totalClicks');
      clicks_el.innerHTML = 'Clicks: ' + totalClicks;
      //var md = new Date();
      //log.data.push({'clicks':  totalClicks});

      create_log();
    });
  });

  loadScript('https://cdn.rawgit.com/keithamus/jwerty/master/jwerty.js', function(){


    document.addEventListener('keydown', function(event){
      key=event.key;
    }, false);

    jwerty.key('⇧+[a-z]/[a-z]/space/⌫/↓/↑', function(){
      if (key==='Backspace'){
        key='*'
      }
      word = word + key;

      var keys_el = document.getElementById('keysString');
      //var to=word.length-10<0?word.length:word.length-10;
      var suffix = (word.length-20<0)? word:word.substr(word.length-20);
      keys_el.innerHTML = 'Keys: ' + suffix;
      logger(key, 'keys');
    });

    jwerty.key('enter', function(){
      create_log();
    })

  });

  function loadScriptJquery(url, callback) {
    /* Load script from url and calls callback once it's loaded */
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('src', url);
    if (typeof callback !== 'undefined') {
      if (scriptTag.readyState) {
        /* For old versions of IE */
        scriptTag.onreadystatechange = function () {
          if (this.readyState === 'complete' || this.readyState === 'loaded') {
            callback();
          }
        };
      } else {
        scriptTag.onload = callback;
      }
    }
    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(scriptTag);
  }

  /* Load jQuery */
  loadScriptJquery('https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.js', function() {
    /* Restore $ and window.jQuery to their previous values and store the
     new jQuery in our local jQuery variables. */
    $ = jQuery = window.jQuery.noConflict(true);
    /* Load jQuery plugin and execute the main logic of our widget once the
     plugin is loaded is loaded */
    loadScriptJquery('https://cdn.rawgit.com/loganfranken/Cursometer/master/script/jquery.cursometer.1.0.0.js', function() {

      var prev_s;
      var acc_speed=0;
      var printed = false;
      $('body').cursometer({
        updateSpeedRate: 1000,
        onUpdateSpeed: function (s) {
          var speed_el = document.getElementById('speedP');
          speed_el.innerHTML = 'px/ms: ' + s.toFixed(2);
          if (s>0 && s!==prev_s){
            acc_speed= (acc_speed+s)/2;
            printed=false;
            //  var avgSpeed_el = document.getElementById('avgSpeed');
          //  avgSpeed = (avgSpeed+s)/2.0;
          //  avgSpeed_el.innerHTML = 'Avg px/ms: ' + avgSpeed.toFixed(2);
          //
          } else {
            if (!printed) {
              logger(acc_speed, 'speed');
              printed=true;
            }
            acc_speed=0;
          }
          prev_s=s;
        }
      });
    });
  });

  function loadPanel(){
    var panel = document.createElement('div');
    panel.setAttribute('style', 'font-size:0.8em;position:fixed; right:0; top:60px; height:220px;width:250px;z-index:1000;background-color:rgba(255,255,255,0.5);border:2px solid black;margin:5px;border-radius:5px;');
    panel.setAttribute('id', 'panel-stats');

    var distanceTraveled_el = document.createElement('div');
    distanceTraveled_el.setAttribute('id', 'distanceTraveled');
    distanceTraveled_el.setAttribute('style', 'color:black;    text-align: left;');
    distanceTraveled_el.innerHTML = 'mm:';
    panel.appendChild(distanceTraveled_el);

    var pixelsTraveled_el = document.createElement('div');
    pixelsTraveled_el.setAttribute('id', 'pixelsTraveled');
    pixelsTraveled_el.setAttribute('style', 'color:black;    text-align: left;');
    pixelsTraveled_el.innerHTML = 'px:';
    panel.appendChild(pixelsTraveled_el);

    var totalMm_el = document.createElement('div');
    totalMm_el.setAttribute('id', 'totalMm');
    totalMm_el.setAttribute('style', 'color:black;    text-align: left;');
    totalMm_el.innerHTML = 'total:';
    panel.appendChild(totalMm_el);

    var speedP_el = document.createElement('div');
    speedP_el.setAttribute('id', 'speedP');
    speedP_el.setAttribute('style', 'color:black;    text-align: left;');
    speedP_el.innerHTML = 'px/ms:';
    panel.appendChild(speedP_el);

    var clicks_el = document.createElement('div');
    clicks_el.setAttribute('id', 'totalClicks');
    clicks_el.setAttribute('style', 'color:black;    text-align: left;');
    clicks_el.innerHTML = 'Clicks: ';
    panel.appendChild(clicks_el);

    var wheel_el = document.createElement('div');
    wheel_el.setAttribute('id', 'wheelDirection');
    wheel_el.setAttribute('style', 'color:black;    text-align: left;');
    wheel_el.innerHTML = 'Wheel: ';
    panel.appendChild(wheel_el);

    var wheelScrolled_el = document.createElement('div');
    wheelScrolled_el.setAttribute('id', 'wheelScrolled');
    wheelScrolled_el.setAttribute('style', 'color:black;    text-align: left;');
    wheelScrolled_el.innerHTML = 'Wheel total: ';
    panel.appendChild(wheelScrolled_el);

    var pagexy_el = document.createElement('div');
    pagexy_el.setAttribute('id', 'pageXYDirection');
    pagexy_el.setAttribute('style', 'color:black;    text-align: left;');
    pagexy_el.innerHTML = 'Page ';
    panel.appendChild(pagexy_el);

    var scroll_el = document.createElement('div');
    scroll_el.setAttribute('id', 'scrollDirection');
    scroll_el.setAttribute('style', 'color:black;    text-align: left;');
    scroll_el.innerHTML = 'Scroll direction: ';
    panel.appendChild(scroll_el);

    var keys_el = document.createElement('div');
    keys_el.setAttribute('id', 'keysString');
    keys_el.setAttribute('style', 'color:black;    text-align: left;');
    keys_el.innerHTML = 'Keys: ';
    panel.appendChild(keys_el);

    document.body.appendChild(panel);
  }
  loadPanel();

}(window, document));