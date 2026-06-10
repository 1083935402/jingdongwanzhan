/**
 * 京东创意商城 - 登录/注册功能
 * 邹华 24215220130
 */

(function() {
  'use strict';

  // ========== 粒子背景 ==========
  (function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var maxParticles = 50;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.4 + 0.1
      };
    }

    for (var i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')';
        ctx.fill();
      }
      // 连线
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  })();

  // ========== 验证码生成 ==========
  function generateCaptcha() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  var captchaImg = document.getElementById('captchaImg');
  var currentCaptcha = generateCaptcha();
  if (captchaImg) {
    captchaImg.textContent = currentCaptcha;
    captchaImg.addEventListener('click', function() {
      currentCaptcha = generateCaptcha();
      captchaImg.textContent = currentCaptcha;
      captchaImg.style.transform = 'scale(0.9)';
      setTimeout(function() { captchaImg.style.transform = 'scale(1)'; }, 150);
    });
  }

  // ========== Tab切换 ==========
  var tabLogin = document.getElementById('tabLogin');
  var tabRegister = document.getElementById('tabRegister');
  var loginCard = document.getElementById('loginCard');

  if (tabLogin && tabRegister && loginCard) {
    tabLogin.addEventListener('click', function() {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginCard.classList.remove('show-register');
      clearAllMsgs();
    });
    tabRegister.addEventListener('click', function() {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      loginCard.classList.add('show-register');
      clearAllMsgs();
    });
  }

  // ========== 用户数据存储 ==========
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('jd_users') || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveUser(user) {
    var users = getUsers();
    // 检查用户是否已存在
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === user.username) return false;
    }
    users.push(user);
    localStorage.setItem('jd_users', JSON.stringify(users));
    return true;
  }

  // ========== Toast提示 ==========
  function showToast(msg, duration) {
    duration = duration || 2500;
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
      toast.classList.remove('show');
    }, duration);
  }

  // ========== 消息提示 ==========
  function showMsg(elId, msg, type) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.className = 'msg-tip ' + (type || '');
  }

  function clearAllMsgs() {
    var loginMsg = document.getElementById('loginMsg');
    var registerMsg = document.getElementById('registerMsg');
    if (loginMsg) { loginMsg.textContent = ''; loginMsg.className = 'msg-tip'; }
    if (registerMsg) { registerMsg.textContent = ''; registerMsg.className = 'msg-tip'; }
  }

  // ========== 注册功能 ==========
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var username = document.getElementById('regUser').value.trim();
      var email = document.getElementById('regEmail').value.trim();
      var phone = document.getElementById('regPhone').value.trim();
      var password = document.getElementById('regPass').value;
      var passConfirm = document.getElementById('regPassConfirm').value;
      var captcha = document.getElementById('regCaptcha').value.trim().toUpperCase();

      // 验证
      if (!username || username.length < 2) {
        showMsg('registerMsg', '用户名至少2个字符', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg('registerMsg', '请输入正确的邮箱格式', 'error');
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        showMsg('registerMsg', '请输入正确的手机号', 'error');
        return;
      }
      if (password.length < 6) {
        showMsg('registerMsg', '密码至少6位', 'error');
        return;
      }
      if (password !== passConfirm) {
        showMsg('registerMsg', '两次密码输入不一致', 'error');
        return;
      }
      if (captcha !== currentCaptcha) {
        showMsg('registerMsg', '验证码错误，请重新输入', 'error');
        currentCaptcha = generateCaptcha();
        captchaImg.textContent = currentCaptcha;
        return;
      }

      // 保存用户
      var result = saveUser({
        username: username,
        email: email,
        phone: phone,
        password: password,
        createdAt: new Date().toISOString()
      });

      if (!result) {
        showMsg('registerMsg', '用户名已存在，请更换', 'error');
        return;
      }

      showMsg('registerMsg', '注册成功！即将跳转到登录...', 'success');
      showToast('注册成功！欢迎加入京东创意商城 🎉');

      // 自动切换到登录并填充用户名
      setTimeout(function() {
        tabLogin.click();
        document.getElementById('loginUser').value = username;
        document.getElementById('loginPass').value = '';
        document.getElementById('loginPass').focus();
        registerForm.reset();
        currentCaptcha = generateCaptcha();
        captchaImg.textContent = currentCaptcha;
      }, 1500);
    });
  }

  // ========== 登录功能 ==========
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var username = document.getElementById('loginUser').value.trim();
      var password = document.getElementById('loginPass').value;
      var remember = document.getElementById('rememberMe').checked;

      if (!username) {
        showMsg('loginMsg', '请输入用户名', 'error');
        return;
      }
      if (!password) {
        showMsg('loginMsg', '请输入密码', 'error');
        return;
      }

      var users = getUsers();
      var found = null;

      for (var i = 0; i < users.length; i++) {
        if (users[i].username === username && users[i].password === password) {
          found = users[i];
          break;
        }
      }

      if (found) {
        // 登录成功
        var loginData = {
          username: found.username,
          email: found.email,
          phone: found.phone,
          loginTime: new Date().toISOString()
        };

        if (remember) {
          localStorage.setItem('jd_currentUser', JSON.stringify(loginData));
        } else {
          sessionStorage.setItem('jd_currentUser', JSON.stringify(loginData));
        }

        showMsg('loginMsg', '登录成功！正在跳转...', 'success');
        showToast('欢迎回来，' + found.username + '！🎉');

        setTimeout(function() {
          window.location.href = 'index.html';
        }, 800);
      } else {
        showMsg('loginMsg', '用户名或密码错误', 'error');
        document.getElementById('loginPass').value = '';
      }
    });
  }

  // ========== 忘记密码 ==========
  var forgotPwd = document.getElementById('forgotPwd');
  if (forgotPwd) {
    forgotPwd.addEventListener('click', function() {
      showToast('提示：密码存储在本地，请重新注册账号。', 3000);
    });
  }

  // ========== 检查是否已登录(自动填充) ==========
  (function autoFill() {
    var savedUser = localStorage.getItem('jd_currentUser') || sessionStorage.getItem('jd_currentUser');
    if (savedUser) {
      try {
        var user = JSON.parse(savedUser);
        var loginUserInput = document.getElementById('loginUser');
        if (loginUserInput) {
          loginUserInput.value = user.username || '';
        }
      } catch(e) {}
    }
  })();

  // ========== URL参数检测(主页跳转来注册) ==========
  (function checkUrlParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'register') {
      setTimeout(function() {
        if (tabRegister) tabRegister.click();
      }, 200);
    }
  })();

})();
