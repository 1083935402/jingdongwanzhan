/**
 * 京东创意商城 - 交互特效
 * 邹华 24215220130 - Web编程技术大作业
 */

document.addEventListener('DOMContentLoaded', function() {

  // ==========================================
  // 0. 登录状态管理
  // ==========================================
  (function checkLoginStatus() {
    var currentUser = localStorage.getItem('jd_currentUser') || sessionStorage.getItem('jd_currentUser');
    var loginLink = document.getElementById('loginLink');
    var registerLink = document.getElementById('registerLink');
    var userBadge = document.getElementById('userBadge');
    var logoutLink = document.getElementById('logoutLink');
    var userNameDisplay = document.getElementById('userNameDisplay');
    var logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
      try {
        var user = JSON.parse(currentUser);
        // 显示已登录状态
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userBadge) userBadge.style.display = '';
        if (logoutLink) logoutLink.style.display = '';
        if (userNameDisplay) userNameDisplay.textContent = user.username;
      } catch(e) {}
    }

    // 退出登录
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('jd_currentUser');
        sessionStorage.removeItem('jd_currentUser');
        if (loginLink) loginLink.style.display = '';
        if (registerLink) registerLink.style.display = '';
        if (userBadge) userBadge.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        alert('已成功退出登录！');
      });
    }
  })();

  // ==========================================
  // 1. Canvas粒子背景动画
  // ==========================================
  (function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var maxParticles = 60;

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
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.7 ? '200,22,35' : '100,100,120'
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
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
        ctx.fill();
      }

      // 画连线
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(180,180,200,' + (0.08 * (1 - dist / 140)) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  })();

  // ==========================================
  // 2. 轮播图
  // ==========================================
  (function bannerSlider() {
    var slides = document.querySelector('.banner-area .slides');
    var dots = document.querySelectorAll('.banner-area .dots span');
    var prevBtn = document.querySelector('.banner-area .banner-arrow.left');
    var nextBtn = document.querySelector('.banner-area .banner-arrow.right');
    if (!slides) return;

    var currentIndex = 0;
    var totalSlides = 3;
    var autoTimer;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;
      var slideEl = slides.querySelector('.slide');
      var slideWidth = slideEl ? slideEl.offsetWidth : 840;
      slides.style.transform = 'translateX(-' + (currentIndex * slideWidth) + 'px)';

      dots.forEach(function(dot, i) {
        dot.className = i === currentIndex ? 'active' : '';
      });
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAuto(); });

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { goToSlide(i); resetAuto(); });
    });

    function startAuto() { autoTimer = setInterval(nextSlide, 4500); }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }
    startAuto();

    // 触摸滑动
    var touchStartX = 0;
    var bannerArea = document.querySelector('.banner-area');
    if (bannerArea) {
      bannerArea.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; });
      bannerArea.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? nextSlide() : prevSlide();
          resetAuto();
        }
      });
    }
  })();

  // ==========================================
  // 3. 秒杀倒计时
  // ==========================================
  (function countdown() {
    var hoursEl = document.getElementById('seckill-hours');
    var minutesEl = document.getElementById('seckill-minutes');
    var secondsEl = document.getElementById('seckill-seconds');
    if (!hoursEl || !minutesEl || !secondsEl) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function update() {
      var now = new Date();
      var end = new Date(now);
      end.setHours(23, 59, 59, 999);
      var diff = Math.max(0, Math.floor((end - now) / 1000));
      hoursEl.textContent = pad(Math.floor(diff / 3600));
      minutesEl.textContent = pad(Math.floor((diff % 3600) / 60));
      secondsEl.textContent = pad(diff % 60);
    }

    update();
    setInterval(update, 1000);
  })();

  // ==========================================
  // 4. 3D卡片倾斜效果
  // ==========================================
  (function card3DTilt() {
    var cards = document.querySelectorAll('.product-card-3d .card-inner');
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateY = ((x - centerX) / centerX) * 8;
        var rotateX = ((centerY - y) / centerY) * 8;
        card.style.transform = 'rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  })();

  // ==========================================
  // 5. 滚动显示动画
  // ==========================================
  (function scrollReveal() {
    var revealElements = document.querySelectorAll('.product-card-3d, .mini-card, .reco-card, .seckill-card');

    function checkReveal() {
      var windowHeight = window.innerHeight;
      revealElements.forEach(function(el) {
        var rect = el.getBoundingClientRect();
        var revealPoint = 120;
        if (rect.top < windowHeight - revealPoint) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }

    // 初始化所有元素样式
    revealElements.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    checkReveal();
    window.addEventListener('scroll', checkReveal);
  })();

  // ==========================================
  // 6. 回到顶部按钮
  // ==========================================
  (function backToTop() {
    var btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      }
    });

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  // ==========================================
  // 7. 搜索框交互
  // ==========================================
  (function searchInteraction() {
    var input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('focus', function() {
      this.placeholder = '搜索你想要的一切...';
    });
    input.addEventListener('blur', function() {
      this.placeholder = '搜索商品、品牌、店铺';
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        this.value = '';
        this.placeholder = '邹华 24215220130 - 搜索功能演示';
        var that = this;
        setTimeout(function() {
          that.placeholder = '搜索商品、品牌、店铺';
        }, 1500);
      }
    });
  })();

  // ==========================================
  // 8. 配送地区选择
  // ==========================================
  (function locationPicker() {
    var locationBtn = document.getElementById('locationBtn');
    var locationPanel = document.getElementById('locationPanel');
    var locationClose = document.getElementById('locationClose');
    var locationArea = document.getElementById('locationArea');
    var provinceList = document.getElementById('provinceList');
    var cityList = document.getElementById('cityList');
    var tabs = document.querySelectorAll('.location-tab');

    if (!locationBtn || !locationPanel) return;

    // 城市数据
    var citiesMap = {
      '北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '大兴区', '顺义区', '昌平区', '房山区'],
      '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '浦东新区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '松江区'],
      '天津': ['和平区', '河东区', '河西区', '南开区', '河北区', '滨海新区', '东丽区', '西青区', '北辰区', '武清区'],
      '重庆': ['渝中区', '江北区', '南岸区', '沙坪坝区', '九龙坡区', '渝北区', '巴南区', '万州区', '涪陵区', '永川区'],
      '广东': ['广州', '深圳', '东莞', '佛山', '珠海', '中山', '惠州', '汕头', '江门', '湛江', '肇庆', '揭阳', '清远'],
      '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '台州', '丽水', '舟山', '衢州'],
      '江苏': ['南京', '苏州', '无锡', '常州', '南通', '徐州', '扬州', '镇江', '盐城', '泰州', '淮安', '连云港', '宿迁'],
      '山东': ['济南', '青岛', '烟台', '潍坊', '临沂', '淄博', '济宁', '威海', '日照', '德州', '泰安', '聊城', '菏泽'],
      '四川': ['成都', '绵阳', '德阳', '宜宾', '南充', '泸州', '达州', '乐山', '凉山', '广安', '眉山', '遂宁'],
      '湖北': ['武汉', '宜昌', '襄阳', '荆州', '黄冈', '十堰', '孝感', '荆门', '鄂州', '黄石', '咸宁', '随州'],
      '湖南': ['长沙', '株洲', '湘潭', '衡阳', '岳阳', '常德', '邵阳', '郴州', '怀化', '永州', '娄底', '益阳'],
      '福建': ['福州', '厦门', '泉州', '漳州', '莆田', '龙岩', '三明', '宁德', '南平'],
      '河南': ['郑州', '洛阳', '开封', '南阳', '许昌', '新乡', '周口', '商丘', '安阳', '信阳', '平顶山', '驻马店', '焦作'],
      '河北': ['石家庄', '唐山', '保定', '邯郸', '廊坊', '沧州', '邢台', '秦皇岛', '张家口', '承德', '衡水'],
      '安徽': ['合肥', '芜湖', '蚌埠', '马鞍山', '安庆', '滁州', '阜阳', '六安', '亳州', '宿州', '淮南', '宣城'],
      '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '锦州', '营口', '丹东', '盘锦', '朝阳', '本溪', '葫芦岛', '辽阳'],
      '陕西': ['西安', '咸阳', '宝鸡', '渭南', '延安', '榆林', '汉中', '安康', '商洛', '铜川'],
      '江西': ['南昌', '九江', '赣州', '宜春', '上饶', '吉安', '抚州', '景德镇', '萍乡', '新余', '鹰潭'],
      '广西': ['南宁', '柳州', '桂林', '玉林', '梧州', '北海', '贵港', '钦州', '百色', '河池', '来宾', '防城港'],
      '山西': ['太原', '大同', '长治', '临汾', '运城', '晋中', '忻州', '吕梁', '晋城', '阳泉', '朔州'],
      '云南': ['昆明', '大理', '曲靖', '玉溪', '丽江', '红河', '昭通', '保山', '普洱', '楚雄', '临沧', '西双版纳'],
      '贵州': ['贵阳', '遵义', '毕节', '六盘水', '铜仁', '黔东南', '黔南', '黔西南', '安顺'],
      '吉林': ['长春', '吉林', '延边', '四平', '通化', '松原', '白城', '白山', '辽源'],
      '黑龙江': ['哈尔滨', '大庆', '齐齐哈尔', '牡丹江', '佳木斯', '绥化', '鸡西', '黑河', '双鸭山', '伊春'],
      '甘肃': ['兰州', '天水', '白银', '庆阳', '平凉', '酒泉', '张掖', '武威', '定西', '陇南', '临夏'],
      '海南': ['海口', '三亚', '儋州', '三沙', '琼海', '文昌', '万宁', '东方', '五指山'],
      '内蒙古': ['呼和浩特', '包头', '鄂尔多斯', '赤峰', '通辽', '呼伦贝尔', '乌兰察布', '巴彦淖尔', '乌海', '锡林郭勒'],
      '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '喀什', '伊犁', '阿克苏', '库尔勒', '石河子'],
      '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
      '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
      '青海': ['西宁', '海东', '海西', '海南', '海北', '玉树', '果洛', '黄南'],
      '香港': ['中西区', '东区', '九龙', '观塘', '南区', '深水埗', '湾仔', '黄大仙', '油尖旺', '离岛'],
      '澳门': ['澳门半岛', '氹仔', '路环', '路氹城'],
      '台湾': ['台北', '新北', '高雄', '台中', '台南', '桃园', '新竹', '基隆', '嘉义', '彰化']
    };

    // 读取保存的地区
    var savedLocation = localStorage.getItem('jd_deliveryLocation');
    if (savedLocation) {
      locationBtn.textContent = savedLocation;
    }

    // 高亮选中的省份
    function highlightSelected() {
      var current = locationBtn.textContent;
      var allProvince = provinceList.querySelectorAll('span');
      allProvince.forEach(function(s) {
        if (s.getAttribute('data-name') === current) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
      var allCity = cityList.querySelectorAll('span');
      allCity.forEach(function(s) {
        if (s.getAttribute('data-full') === current || s.textContent === current) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    }

    // 生成城市列表
    function renderCities(province) {
      cityList.innerHTML = '';
      var cities = citiesMap[province];
      if (!cities) return;
      cities.forEach(function(city) {
        var fullName = province + city;
        var span = document.createElement('span');
        span.textContent = city;
        span.setAttribute('data-name', city);
        span.setAttribute('data-full', fullName);
        span.addEventListener('click', function() {
          selectLocation(fullName);
        });
        cityList.appendChild(span);
      });
    }

    // 选择地区
    function selectLocation(name) {
      locationBtn.textContent = name;
      localStorage.setItem('jd_deliveryLocation', name);
      hidePanel();
    }

    // 显示面板
    function showPanel() {
      locationPanel.classList.add('show');
      highlightSelected();
      // 默认渲染北京的区
      var currentProvince = locationBtn.textContent;
      if (citiesMap[currentProvince]) {
        renderCities(currentProvince);
      } else {
        // 如果是"省份+城市"格式，提取省份
        for (var p in citiesMap) {
          if (currentProvince.indexOf(p) === 0) {
            renderCities(p);
            // 切换到城市tab
            switchTab('city');
            break;
          }
        }
      }
      // 默认显示省份tab
      switchTab('province');
    }

    // 隐藏面板
    function hidePanel() {
      locationPanel.classList.remove('show');
    }

    // 切换tab
    function switchTab(tabName) {
      tabs.forEach(function(t) {
        if (t.getAttribute('data-tab') === tabName) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
      if (tabName === 'province') {
        provinceList.style.display = 'grid';
        cityList.style.display = 'none';
      } else {
        provinceList.style.display = 'none';
        cityList.style.display = 'grid';
      }
    }

    // 事件绑定
    locationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (locationPanel.classList.contains('show')) {
        hidePanel();
      } else {
        showPanel();
      }
    });

    locationClose.addEventListener('click', function(e) {
      e.stopPropagation();
      hidePanel();
    });

    // 省份点击
    provinceList.querySelectorAll('span').forEach(function(span) {
      span.addEventListener('click', function() {
        var province = this.getAttribute('data-name');
        // 直辖市直接选择
        if (['北京', '上海', '天津', '重庆'].indexOf(province) !== -1) {
          selectLocation(province);
        } else {
          renderCities(province);
          switchTab('city');
        }
      });
    });

    // Tab切换
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var tabName = this.getAttribute('data-tab');
        if (tabName === 'city') {
          // 找到当前选中的省份并渲染城市
          var currentProvince = '';
          for (var p in citiesMap) {
            if (locationBtn.textContent.indexOf(p) === 0) {
              currentProvince = p;
              break;
            }
          }
          if (currentProvince) {
            renderCities(currentProvince);
          }
        }
        switchTab(tabName);
        highlightSelected();
      });
    });

    // 点击面板外关闭
    document.addEventListener('click', function(e) {
      if (!locationArea.contains(e.target)) {
        hidePanel();
      }
    });
  })();

  // ==========================================
  // 9. 购物车管理
  // ==========================================
  (function cartManager() {
    var cartBtn = document.getElementById('cartBtn');
    var cartSidebar = document.getElementById('cartSidebar');
    var cartOverlay = document.getElementById('cartOverlay');
    var cartSidebarClose = document.getElementById('cartSidebarClose');
    var cartItemsContainer = document.getElementById('cartItems');
    var cartEmpty = document.getElementById('cartEmpty');
    var cartTotalPrice = document.getElementById('cartTotalPrice');
    var cartCountBadge = document.getElementById('cartCount');

    if (!cartBtn || !cartSidebar) return;

    // 默认购物车数据
    var defaultCart = [
      {
        id: 1,
        name: '旗舰5G智能手机 骁龙8核处理器 120Hz高刷屏 5000mAh大电池',
        price: 2999,
        qty: 1,
        img: 'image/phone1.jpg'
      },
      {
        id: 2,
        name: '真无线降噪蓝牙耳机 空间音频 40小时超长续航',
        price: 399,
        qty: 2,
        img: 'image/product2.jpg'
      },
      {
        id: 3,
        name: '机械键盘 三模连接 热插拔轴 RGB背光 PBT键帽',
        price: 299,
        qty: 1,
        img: 'image/product5.jpg'
      }
    ];

    // 从 localStorage 读取购物车
    var cart = [];
    var savedCart = localStorage.getItem('jd_cart');
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch(e) {
        cart = defaultCart;
      }
    } else {
      cart = defaultCart;
    }

    // 保存购物车
    function saveCart() {
      localStorage.setItem('jd_cart', JSON.stringify(cart));
    }

    // 计算总价
    function calcTotal() {
      var total = 0;
      cart.forEach(function(item) {
        total += item.price * item.qty;
      });
      return total;
    }

    // 计算总数
    function calcCount() {
      var count = 0;
      cart.forEach(function(item) {
        count += item.qty;
      });
      return count;
    }

    // 更新角标
    function updateBadge() {
      var count = calcCount();
      cartCountBadge.textContent = count;
      if (count > 0) {
        cartCountBadge.style.display = '';
      } else {
        cartCountBadge.style.display = 'none';
      }
    }

    // 渲染购物车
    function renderCart() {
      cartItemsContainer.innerHTML = '';

      if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartEmpty.style.display = 'flex';
      } else {
        cartItemsContainer.style.display = 'block';
        cartEmpty.style.display = 'none';

        cart.forEach(function(item, index) {
          var itemEl = document.createElement('div');
          itemEl.className = 'cart-item';
          itemEl.innerHTML = '' +
            '<div class="cart-item-img"><img src="' + item.img + '" alt="' + item.name + '"></div>' +
            '<div class="cart-item-info">' +
              '<div class="cart-item-name">' + item.name + '</div>' +
              '<div class="cart-item-actions">' +
                '<span class="cart-item-price">¥' + item.price + '</span>' +
                '<div class="cart-item-qty">' +
                  '<button class="qty-minus" data-index="' + index + '">−</button>' +
                  '<span class="qty-num">' + item.qty + '</span>' +
                  '<button class="qty-plus" data-index="' + index + '">+</button>' +
                '</div>' +
                '<span class="cart-item-remove" data-index="' + index + '">删除</span>' +
              '</div>' +
            '</div>';
          cartItemsContainer.appendChild(itemEl);
        });

        // 绑定数量增减事件
        cartItemsContainer.querySelectorAll('.qty-minus').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var idx = parseInt(this.getAttribute('data-index'));
            if (cart[idx].qty > 1) {
              cart[idx].qty -= 1;
            } else {
              cart.splice(idx, 1);
            }
            saveCart();
            renderCart();
            updateBadge();
          });
        });

        cartItemsContainer.querySelectorAll('.qty-plus').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var idx = parseInt(this.getAttribute('data-index'));
            cart[idx].qty += 1;
            saveCart();
            renderCart();
            updateBadge();
          });
        });

        // 绑定删除事件
        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var idx = parseInt(this.getAttribute('data-index'));
            cart.splice(idx, 1);
            saveCart();
            renderCart();
            updateBadge();
          });
        });
      }

      // 更新总价
      cartTotalPrice.textContent = '¥' + calcTotal().toFixed(2);
    }

    // 打开购物车
    function openCart() {
      cartSidebar.classList.add('open');
      cartOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      renderCart();
    }

    // 关闭购物车
    function closeCart() {
      cartSidebar.classList.remove('open');
      cartOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    // 添加到购物车
    function addToCart(product) {
      // 检查是否已存在同款商品
      var found = cart.find(function(item) {
        return item.name === product.name;
      });
      if (found) {
        found.qty += product.qty || 1;
      } else {
        cart.push({
          id: Date.now(),
          name: product.name,
          price: product.price,
          qty: product.qty || 1,
          img: product.img
        });
      }
      saveCart();
      updateBadge();
      renderCart();
    }

    // 事件绑定
    cartBtn.addEventListener('click', function() {
      if (cartSidebar.classList.contains('open')) {
        closeCart();
      } else {
        openCart();
      }
    });

    cartSidebarClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ESC关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
        closeCart();
      }
    });

    // 给所有"加入购物车"按钮绑定事件
    document.querySelectorAll('.quick-actions button:last-child').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var card = this.closest('.product-card-3d');
        if (!card) return;
        var nameEl = card.querySelector('.card-name');
        var priceEl = card.querySelector('.card-price');
        var imgEl = card.querySelector('.card-img-wrap img');
        var name = nameEl ? nameEl.textContent.trim() : '商品';
        var priceText = priceEl ? priceEl.textContent.trim().replace('¥', '') : '0';
        var price = parseFloat(priceText) || 0;
        var img = imgEl ? imgEl.getAttribute('src') : '';

        addToCart({
          name: name,
          price: price,
          qty: 1,
          img: img
        });

        // 添加反馈动画
        var feedback = document.createElement('div');
        feedback.textContent = '✓ 已加入购物车';
        feedback.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
          'background:var(--jd-red);color:#fff;padding:10px 24px;border-radius:20px;font-size:14px;' +
          'z-index:99999;animation:toastIn 0.3s ease, toastOut 0.3s 1.2s ease forwards;';
        document.body.appendChild(feedback);
        setTimeout(function() { document.body.removeChild(feedback); }, 1600);
      });
    });

    // Toast动画
    var toastStyle = document.createElement('style');
    toastStyle.textContent = '' +
      '@keyframes toastIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.8); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }' +
      '@keyframes toastOut { from { opacity:1; } to { opacity:0; transform:translate(-50%,-50%) translateY(-20px); } }';
    document.head.appendChild(toastStyle);

    // 结算按钮
    var checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
          alert('购物车是空的，快去逛逛吧~');
          return;
        }
        var total = calcTotal();
        var count = calcCount();
        alert('订单提交成功！\n共 ' + count + ' 件商品\n合计：¥' + total.toFixed(2) + '\n\n感谢您的购买！（演示功能）');
        cart = [];
        saveCart();
        renderCart();
        updateBadge();
        closeCart();
      });
    }

    // 初始化渲染
    updateBadge();
  })();

  // ==========================================
  // 10. 创意光标尾随效果
  // ==========================================
  (function cursorTrail() {
    var trailer = document.createElement('div');
    trailer.style.cssText = 'position:fixed;width:20px;height:20px;border-radius:50%;pointer-events:none;z-index:99999;' +
      'background:radial-gradient(circle,rgba(200,22,35,0.3),transparent);' +
      'transition:transform 0.15s ease-out;transform:translate(-50%,-50%);';
    document.body.appendChild(trailer);

    var mouseX = 0, mouseY = 0;
    var trailX = 0, trailY = 0;

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      trailer.style.left = trailX + 'px';
      trailer.style.top = trailY + 'px';
      requestAnimationFrame(animateTrail);
    }
    animateTrail();
  })();

});
