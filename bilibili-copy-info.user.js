// ==UserScript==
// @name         B站动态一键复制关键信息
// @namespace    https://github.com/anomalyco/bilibili-copy-info
// @version      1.3.0
// @description  在B站动态页面视频投稿下方增加复制按钮，一键复制主播名、UID、BV号
// @author       Moeka
// @match        https://t.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// @grant        GM_addStyle
// @license      AGPL-3.0
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
.bili-copy-anchor {
    position: relative;
}
.bili-copy-btn-wrapper {
    position: absolute;
    bottom: 4px;
    right: 4px;
    z-index: 1;
}
.bili-copy-btn {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    line-height: 18px;
    color: #9499A0;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #E3E5E7;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    white-space: nowrap;
    outline: none;
}
.bili-copy-btn:hover {
    color: #00A1D6;
    border-color: #00A1D6;
    background: rgba(0, 161, 214, 0.05);
}
.bili-copy-btn.copied {
    color: #52c41a;
    border-color: #52c41a;
    background: rgba(82, 196, 26, 0.05);
}
    `.trim());

    var PROCESSED_ATTR = 'data-bili-copy-done';

    function getListData() {
        var listEl = document.querySelector('.bili-dyn-list');
        if (!listEl || !listEl.__vue__) return null;
        return listEl.__vue__.list;
    }

    function extractBV(href) {
        if (!href) return '';
        var m = href.match(/\/video\/(BV[\w]+)/);
        return m ? m[1] : '';
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            btn.classList.add('copied');
            setTimeout(function () {
                btn.textContent = '复制';
                btn.classList.remove('copied');
            }, 1500);
        }).catch(function () {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.textContent = '已复制';
            btn.classList.add('copied');
            setTimeout(function () {
                btn.textContent = '复制';
                btn.classList.remove('copied');
            }, 1500);
        });
    }

    function createButton(name, uid, bv) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bili-copy-btn-wrapper';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bili-copy-btn';
        btn.textContent = '复制';
        btn.title = '复制: ' + name + ' / ' + uid + ' / ' + bv;

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var text = name + '\t' + uid + '\t\t' + bv;
            copyToClipboard(text, btn);
        });

        wrapper.appendChild(btn);
        return wrapper;
    }

    function processCard(cardEl) {
        if (cardEl.hasAttribute(PROCESSED_ATTR)) return;

        var videoLink = cardEl.querySelector('a.bili-dyn-card-video');
        if (!videoLink) return;

        var bv = extractBV(videoLink.href);
        if (!bv) return;

        var list = getListData();
        if (!list) return;

        var allCards = document.querySelectorAll('.bili-dyn-list__item');
        var idx = -1;
        for (var i = 0; i < allCards.length; i++) {
            if (allCards[i] === cardEl) { idx = i; break; }
        }
        if (idx < 0 || idx >= list.length) return;

        var cardData = list[idx];
        if (!cardData || !cardData.modules || !cardData.modules.module_author) return;

        var author = cardData.modules.module_author;
        var name = author.name;
        var uid = author.mid;

        if (!name || uid == null) return;

        cardEl.setAttribute(PROCESSED_ATTR, '1');

        var btnWrapper = createButton(name, uid, bv);
        var anchor = cardEl.querySelector('.bili-dyn-content__orig__major') ||
                     cardEl.querySelector('.suit-video-card') ||
                     cardEl.querySelector('a.bili-dyn-card-video');
        if (anchor) {
            anchor.classList.add('bili-copy-anchor');
            anchor.appendChild(btnWrapper);
        }
    }

    function scanAndProcess() {
        var cards = document.querySelectorAll('.bili-dyn-list__item');
        for (var i = 0; i < cards.length; i++) {
            processCard(cards[i]);
        }
    }

    var scanTimer = null;
    var observer = new MutationObserver(function () {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(scanAndProcess, 500);
    });

    function init() {
        scanAndProcess();
        var target = document.getElementById('dyn-home-app') || document.getElementById('app') || document.body;
        observer.observe(target, { childList: true, subtree: true });
    }

    function waitForApp() {
        if (document.querySelector('.bili-dyn-list')) {
            setTimeout(init, 800);
        } else if (document.getElementById('dyn-home-app') || document.getElementById('app')) {
            var appObs = new MutationObserver(function () {
                if (document.querySelector('.bili-dyn-list')) {
                    appObs.disconnect();
                    setTimeout(init, 800);
                }
            });
            appObs.observe(document.body, { childList: true, subtree: true });
        } else {
            var startupObs = new MutationObserver(function () {
                var app = document.getElementById('dyn-home-app') || document.getElementById('app');
                if (app) {
                    startupObs.disconnect();
                    var innerObs = new MutationObserver(function () {
                        if (document.querySelector('.bili-dyn-list')) {
                            innerObs.disconnect();
                            setTimeout(init, 800);
                        }
                    });
                    innerObs.observe(app, { childList: true, subtree: true });
                }
            });
            startupObs.observe(document.body, { childList: true, subtree: true });
        }
    }

    waitForApp();
})();
