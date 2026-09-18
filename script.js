(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------
     Letter-by-letter title reveal (hero + finale)
  ------------------------------------------------- */
  document.querySelectorAll(".letters").forEach(function(el){
    var word = el.getAttribute("data-word") || el.textContent;
    el.innerHTML = "";
    word.split("").forEach(function(ch){
      var span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      if(!reduceMotion){
        span.style.opacity = 0;
        span.style.transform = "translateY(28px)";
        span.style.transition = "opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1)";
      }
      el.appendChild(span);
    });
  });

  function revealChars(container, baseDelay){
    container.querySelectorAll(".char").forEach(function(span, i){
      setTimeout(function(){
        span.style.opacity = 1;
        span.style.transform = "translateY(0)";
      }, baseDelay + i * 28);
    });
  }

  if(!reduceMotion){
    var heroLetters = document.querySelector("#heroTitle .letters");
    if(heroLetters){ revealChars(heroLetters, 200); }
  }

  /* Finale letters reveal once scrolled into view */
  var finaleLetters = document.querySelector(".finale-title .letters");
  if(finaleLetters){
    if(reduceMotion){
      finaleLetters.querySelectorAll(".char").forEach(function(c){ c.style.opacity = 1; });
    } else {
      var revealed = false;
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting && !revealed){
            revealed = true;
            revealChars(finaleLetters, 0);
          }
        });
      }, { threshold:.5 });
      io.observe(finaleLetters);
    }
  }

  /* -------------------------------------------------
     Menu bar live clock
  ------------------------------------------------- */
  var clockEl = document.getElementById("menubarClock");
  function updateClock(){
    if(!clockEl) return;
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if(h === 0) h = 12;
    var mm = m < 10 ? "0" + m : m;
    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var mons = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    clockEl.textContent = days[now.getDay()] + " " + mons[now.getMonth()] + " " + now.getDate() + "  " + h + ":" + mm + " " + ampm;
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* -------------------------------------------------
     Dock: magnify-on-hover + active section indicator
  ------------------------------------------------- */
  var dock = document.getElementById("dock");
  var dockItems = dock ? Array.prototype.slice.call(dock.querySelectorAll(".dock-item")) : [];

  if(dock && dockItems.length && window.matchMedia("(hover:hover) and (min-width:900px)").matches && !reduceMotion){
    dock.addEventListener("mousemove", function(e){
      dockItems.forEach(function(item){
        var rect = item.getBoundingClientRect();
        var center = rect.left + rect.width / 2;
        var dist = Math.abs(e.clientX - center);
        var maxDist = 110;
        var scale = 1;
        if(dist < maxDist){
          scale = 1 + (1 - dist / maxDist) * 0.55;
        }
        item.style.transform = "scale(" + scale.toFixed(2) + ")";
      });
    });
    dock.addEventListener("mouseleave", function(){
      dockItems.forEach(function(item){ item.style.transform = "scale(1)"; });
    });
  }

  var sections = dockItems
    .map(function(item){ return document.querySelector(item.getAttribute("href")); })
    .filter(Boolean);

  if(sections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var id = "#" + entry.target.id;
        var item = dockItems.find(function(d){ return d.getAttribute("href") === id; });
        if(!item) return;
        if(entry.isIntersecting){
          dockItems.forEach(function(d){ d.classList.remove("is-active"); });
          item.classList.add("is-active");
        }
      });
    }, { threshold:0.4, rootMargin:"-10% 0px -50% 0px" });
    sections.forEach(function(s){ spy.observe(s); });
  }

  /* -------------------------------------------------
     Animated stat counters
  ------------------------------------------------- */
  document.querySelectorAll(".stat-number").forEach(function(el){
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var done = false;
    function run(){
      if(done) return;
      done = true;
      var startTime = null;
      var duration = 1200;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.floor(eased * target);
        el.textContent = val.toLocaleString() + suffix;
        if(progress < 1){ requestAnimationFrame(step); }
        else { el.textContent = target.toLocaleString() + suffix; }
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting) run(); });
    }, { threshold:.6 });
    io.observe(el);
  });

  /* -------------------------------------------------
     Skill ring: animate conic-gradient fill on scroll into view
  ------------------------------------------------- */
  document.querySelectorAll(".skill-ring").forEach(function(ring){
    var target = parseInt(ring.getAttribute("data-pct"), 10) || 0;
    var pctLabel = ring.parentElement.querySelector(".skill-pct");
    var done = false;
    function run(){
      if(done) return;
      done = true;
      var startTime = null;
      var duration = 1100;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.round(eased * target);
        ring.style.setProperty("--ring", val + "%");
        if(pctLabel) pctLabel.textContent = val + "%";
        if(progress < 1){ requestAnimationFrame(step); }
        else { ring.style.setProperty("--ring", target + "%"); if(pctLabel) pctLabel.textContent = target + "%"; }
      }
      requestAnimationFrame(step);
    }
    if(reduceMotion){
      ring.style.setProperty("--ring", target + "%");
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting) run(); });
      }, { threshold:.5 });
      io.observe(ring);
    }
  });

})();
