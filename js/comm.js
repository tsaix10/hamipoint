(function () {
  "use strict";  
  document.addEventListener('DOMContentLoaded', function () {
    var webRoot = typeof web_root === 'undefined' ? '' : web_root,
        win = window,
        winInner = win.innerWidth,
        body = document.body,
        tgBtns = document.querySelectorAll('.tg-btn'),
        dynNodes = document.querySelectorAll('.dyn-node'),
        tbJs = document.querySelectorAll('.tb-js'),
        brokenWidth = 1024;

    //移動物件
    function moveNode() {
        var parentNodeClass = winInner >= brokenWidth ? '.node-pc' : '.node-mobile';
        dynNodes.forEach(function (dynNode) {
          var selfNode = dynNode.getAttribute('data-node');
          var parent = document.querySelector(`${parentNodeClass}[data-child="${selfNode}"]`);
          if (parent && !dynNode.parentElement.classList.contains(parentNodeClass)) {
            parent.appendChild(dynNode);
          }
        });
    }

    // 核對開合物件
    function findContainer(element, tgData) {
        var targetEl = element.parentNode;
        while (targetEl) {
            if (targetEl.classList.contains(tgData)) {
                return targetEl;
            }
            targetEl = targetEl.parentNode;
        }
        return null;
    };

    // 開合容器的click
    function tgBtnClink(tgBtn) {
        tgBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var tgData = tgBtn.getAttribute('data-target');
            var tgMom = findContainer(tgBtn, tgData);
            console.log(tgMom);
            tgBtn.classList.toggle('on');
            if (tgMom) {
                tgMom.classList.toggle('on');
            }
        });
    }

    tgBtns.forEach(tgBtnClink);    
      
    // 表格變化
    if (tbJs.length) {
        tbJs.forEach(function (table) {
            var th = table.querySelectorAll('th');
            var td = table.querySelectorAll('td');

            function setAttr(element) {
                var idx = Array.from(element.parentNode.children).indexOf(element);
                var text = th[idx].textContent;
                element.setAttribute('data-txt', text);
            }

            td.forEach(function (element) {
                setAttr(element);
            });
        });
    };

    // 視窗寬度變動 讀入
    function widthChange() {
        var newWidth = win.innerWidth;
        return newWidth !== winInner;
    }
    function preRwd() {
        if (widthChange()) {
            winInner = win.innerWidth; // 更新寬度
        }
        moveNode();
    }
    win.addEventListener('resize', preRwd);
    win.addEventListener('load', preRwd);
    preRwd();

  });
})();
