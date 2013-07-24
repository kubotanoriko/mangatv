(function(global) {
    'use strict';

    function loadImage(src, onload) {
        var img = new Image();
        img.src = src;
        img.onload = onload;
        return img;
    }
    
    var goImg = loadImage('/img/go.png');
    var dotImg = loadImage('/img/dot.png');
    var donImg = loadImage('/img/don.png');
    var banImg = loadImage('/img/ban.png');
    var zawaImg = loadImage('/img/zawa.png');
    var shi_nImg = loadImage('/img/shi-n.png');
    
    var commandImgs = {
        don: {
            img: donImg,
            x: 200,
            y: 20
        },
        ban: {
            img: banImg,
            x: 200,
            y: 200
        }
    };
    
    // 5zap=ゴ
    
    // zapが来るたびに、カウントをプラスする
    // タイマーがチェックし、カウントを5減らす
    // カウントが5を超えていたら、一つ「ゴ」を出す。
    // カウントが5未満だったら、「ゴ」が一つ前に出ていれば「...」を、それ以外は何もしない。
    var GO_COUNT = 5;
    var ZAWA_COUNT = 3;
    var ANIM_INTERVAL = 1000;

    function SoundEffects(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.count = 0;
        this._imgList = [];
        this.options = options || {};
        this._start();
    }
    SoundEffects.prototype = {
        addCount: function(n) {
            this.count += n;
        },
        _start: function() {
            var self = this;
            var imgList = self._imgList;
            // アニメーションの対象となるオブジェクトの構築
            setInterval(function() {
                if (self.count >= GO_COUNT) {
                    imgList.push({
                        type: 'go',
                        img: goImg,
                        timestamp: Date.now()
                    });
                    self.count -= GO_COUNT;
                } else if (self.count >= ZAWA_COUNT) {
                    imgList.push({
                        type: 'zawa',
                        img: zawaImg,
                        timestamp: Date.now()
                    });
                    self.count -= ZAWA_COUNT;
                } else {
                    // 最後が「ゴ」で終わっていたら、「・・・」を出す
                    if (imgList.length > 0 && imgList[imgList.length - 1].type === 'go') {
                        imgList.push({
                            type: 'dot',
                            img: dotImg,
                            timestamp: Date.now()
                        });
                    }
                    self.count = 0;
                }
            }, ANIM_INTERVAL);
            // アニメーションループ
            if (self.options.autoDraw) {
                var drawFrame = function() {
                    self.draw();
                    requestAnimationFrame(drawFrame);
                };
                drawFrame();
            }
        },
        prevDraw: 0,
        draw: function() {
            var self = this;
            var imgList = this._imgList;
            if (imgList.length === 0) {
                return;
            }
            var now = Date.now();
            var move = self.prevDraw ? (now - self.prevDraw) / 10 : 0;
            (function calcPos() {
                var Y = 20;
                for (var i = 0, n = imgList.length; i < n; i++) {
                    var elem = imgList[i];
                    if (elem.x === undefined) {
                        // まず最初は画面の右端から出る
                        var x = self.canvas.width;
                        if (i > 0) {
                            var prevElem = imgList[i - 1];
                            var prevElemEnd = prevElem.x + prevElem.img.naturalWidth;
                            // 前の要素に重ならないようにする
                            if (prevElemEnd > x) {
                                x = prevElemEnd;
                            }
                        }
                        // 画面外に消えてしまった要素は配列から削除
                        if (x < -elem.img.naturalWidth) {
                            imgList.shift();
                            i--;
                            continue;
                        }
                        elem.x = x;
                    } else {
                        elem.x -= move;
                    }
                    elem.y = Y;
                }
                
                /*
                var startElem = null;
                while (true) {
                    if (imgList.length === 0) {
                        return;
                    }
                    var startElem = imgList[0];
                    var startTime = startElem.timestamp;
                    var distance = (now - startElem.timestamp) / 10;
                    var x = self.canvas.width - distance;
                    // 画面外に描画する画像はリストの先頭から削除する
                    if (x < -startElem.img.naturalWidth) {
                        imgList.shift();
                    } else {
                        startElem.x = x;
                        startElem.y = Y;
                        break;
                    }
                }
                var prevElem = startElem;
                for (var i = 1, n = imgList.length; i < n; i++) {
                    var elem = imgList[i];
                    var distance = (now - elem.timestamp) / 10;
                    var prevElemX = prevElem.x + prevElem.img.naturalWidth;
                    // 前に表示した要素に重ならないように出す
                    if (prevElemX > distance) {
                        elem.x = prevElemX;
                    } else {
                        elem.x = distance;
                    }
                    elem.y = Y;
                    prevElem = elem;
                }
                */
            })();
            
            for (var i = 0; i < imgList.length; i++) {
                var elem = imgList[i];
                var img = elem.img;
                var x = elem.x;
                var y = elem.y;
                self.ctx.drawImage(img, x, y, img.naturalWidth, img.naturalHeight);
                console.log('x=' + x + ',y=' + y + ',w=' + img.naturalWidth + ',h=' + img.naturalHeight);
            }
            self.prevDraw = now;
        },
        command: function(cmd) {
            var commandImgInfo = commandImgs[cmd];
            var commandImg = commandImgInfo.img;

            var x = (this.canvas.width - commandImg.naturalWidth) / 2;
            this.ctx.drawImage(commandImg, x, commandImgInfo.y, commandImg.naturalWidth, commandImg.naturalHeight);
        }
    };
    global.SoundEffects = SoundEffects;
})(this);
