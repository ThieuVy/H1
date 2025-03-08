//Polyfill cho requestAnimationFrame
/*
    Đảm bảo requestAnimationFrame hoạt động nhất quán trên các trình duyệt khác nhau.
    Nếu trình duyệt không hỗ trợ requestAnimationFrame, một cách thay thế bằng setTimeout được sử dụng.
*/
window.requestAnimationFrame =  
    window.___requestAnimationFrame ||  // Một phiên bản custom (nếu có)
    window.requestAnimationFrame ||    // Phiên bản chuẩn
    window.webkitRequestAnimationFrame || // Chrome, Safari cũ
    window.mozRequestAnimationFrame ||    // Firefox cũ
    window.oRequestAnimationFrame ||      // Opera cũ
    window.msRequestAnimationFrame ||     // Internet Explorer cũ
    (function(){
        // Nếu không có, dùng cách thay thế bằng setTimeout
        return function(callback, element) {
            var lastTime = element.__lastTime; // Lưu thời gian gọi trước đó
            if (lastTime === undefined) {
                lastTime = 0; 
            }
            var currTime = Date.now(); // Thời gian hiện tại
            var timeToCall = Math.max(1, 33 - (currTime - lastTime)); // Tính khoảng thời gian cần đợi
            window.setTimeout(callback, timeToCall); // Gọi callback
            element.__lastTime = currTime + timeToCall; // Cập nhật thời gian
        }; 
    })();

//Xác định thiết bị di động
/* Xác định xem người dùng có đang sử dụng thiết bị di động không dựa trên chuỗi navigator.userAgent. */
window.isDeivice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera) + '').toLowerCase()));

//Khởi tạo
//Đảm bảo đoạn mã chỉ chạy một lần, ngay cả khi hàm init được gọi nhiều lần.
var loaded = false;
var init = function() {
    if (loaded) {
        return;
    }
    loaded = true;

    //Thiết lập Canvas
    /*
     * Cài đặt kích thước canvas, giảm kích thước nếu là thiết bị di động (koef).
    */
    var mobile = window.isDeivice;
    var koef = mobile ? 0.5 : 1; // Giảm kích thước trên thiết bị di động
    var canvas = document.getElementById('heart'); // Lấy phần tử canvas từ DOM
    var ctx = canvas.getContext('2d'); // Lấy ngữ cảnh vẽ 2D
    var width = canvas.width = koef * innerWidth; // Đặt chiều rộng canvas
    var height = canvas.height = koef * innerHeight; // Đặt chiều cao canvas

    var rand = Math.random;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '30px Arial';
    ctx.fillText('LOVE H', 10, 50);

    //Hàm vẽ hình trái tim
    var heartPosition = function(rad) {
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };
    
    //Tỉ lệ và dịch chuyển các điểm
    var scaleAndTranslate = function(pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    //Canvas đáp ứng
    window.addEventListener('resize', function() {
        width = canvas.width = koef * innerWidth;
        height = canvas.height = koef * innerHeight;
        ctx.fillStyle = 'rgba(0,0,0,1)'; //Làm mới canvas
        ctx.fillRect(0, 0, width, height);
    });

    //Khởi tạo hạt
    var traceCOunt = mobile ? 20 : 50;
    var pointsOrigin = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    
    for (i = 0; i < Math.PI * 2; i+= dr) {
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    }
    for (i = 0; i < Math.PI * 2; i+= dr) {
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    }
    for (i = 0; i < Math.PI * 2; i+= dr) {
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    }

    var heartPointsCount = pointsOrigin.length;
    var targetPoints = [];
    var pulse = function (kx, ky){
        for (i = 0; i < heartPointsCount; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width; // Vị trí ngẫu nhiên theo chiều rộng
        var y = rand() * height; // Vị trí ngẫu nhiên theo chiều cao
        e[i] = {
            vx: 0, vy: 0, // Vận tốc ban đầu
            R: 2,         // Bán kính
            speed: rand() + 5, // Tốc độ
            q: ~~(rand() * heartPointsCount), // Mục tiêu ngẫu nhiên
            D: 2 * (i % 2) - 1, // Hướng di chuyển
            force: 0.2 * rand() + 0.7, // Lực di chuyển
            f: "rgb(250, 117, 135)", // Màu sắc
            trace: [] // Vệt hạt
        };

        for (var k = 0; k < traceCOunt; k++) {
            e[i].trace[k] = { x: x, y: y }; // Vị trí vệt ban đầu
        }
    }
    var config = {
        traceK: 0.4,
        timeDelta: 0.6
    };

    var time = 0;
    //Vòng lặp hoạt ảnh
    var loop = function() {
        var n = -Math.cos(time);
        pulse((1 + n) * 0.5, (1 + n) * 0.5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;
        ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Làm mờ nền (tạo hiệu ứng vệt)
        ctx.fillRect(0, 0, width, height);

        for (i = e.length; i--;) {
            var u = e[i]; // Hạt hiện tại
            var q = targetPoints[u.q]; // Điểm mục tiêu
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy); // Khoảng cách đến mục tiêu

            if (10 > length){
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount); // Khoảng cách đến mục tiêu
                }
                else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }

            // Cập nhật vận tốc
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            // Di chuyển hạt
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force; // Giảm vận tốc theo thời gian
            u.vy *= u.force;
            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
            // Vẽ vệt hạt
            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }
        window.requestAnimationFrame(loop, canvas); // Lặp lại
    };
    loop(); // Khởi động vòng lặp
}

//Khởi động hoạt ảnh
var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init, false);
}
