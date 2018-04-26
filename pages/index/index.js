//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');
var that;
Page({
  data: {
    navbar: [
      '首页', '分类', '搜索', '我的'
    ],
    currentTab: 0, // 导航栏切换索引

    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },

    transClassArr: ['tanslate0', 'tanslate1', 'tanslate2', 'tanslate3', 'tanslate4', 'tanslate5'],
    currentMenuIndex: 0,

    slider: [],
    radioList: [],
    songList: [],

    scrollviewH: 0, // 搜索结果的scrollview高度

    searchKeyword: "", // 搜索关键词
    searchResultShow: false, // 是否显示搜索结果
    searchCancelShow: false, // 是否显示取消按钮

    searchPageNum: 1, // 分页数
    searchLoading: false, // 加载更多
    searchLoadingComplete: false, // 加载更多结束
    scrollFlag: true, // 上拉分页加载条件

    searchPageSize: 0, // 每页多少
    searchTotalNum: 0, // 结果总条数
    scrollToView: 'scrollTop', // 返回顶部位置
    backToTop: false, // 返回顶部
    
  },

  /*切换分类*/
  changeCategory: function (event) {
    console.log(event);
    var index = event.currentTarget.dataset.index;
    this.setData({
      currentMenuIndex: index
    });

    //如果数据是第一次请求
    // if (!this.isLoadedData(index)) {
    //   var that = this;
    //   this.getProductsByCategory(id, (data) => {
    //     that.setData(that.getDataObjForBind(index, data));
    //   });
    // }
  },

  _updateSelectedPage(page) {
    let { navbar, stv, currentTab } = this.data;
    currentTab = page;
    this.setData({ currentTab: currentTab });
    stv.offset = stv.windowWidth * currentTab;
    this.setData({ stv: this.data.stv });
  },

  // 导航栏操作
  onNavbarTap: function (e) {
    // this.setData({currentTab: ev.currentTarget.dataset.index});
    this._updateSelectedPage(e.currentTarget.dataset.index);
  },

  _initNavbar: function(){
    try {
      let { navbar } = this.data;
      var res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.stv.lineWidth = this.windowWidth / this.data.navbar.length;
      this.data.stv.windowWidth = res.windowWidth;
      this.setData({ stv: this.data.stv })
      this.navbarCount = navbar.length;
    } catch (e) {}
  },

  handlerStart(e) {
    let { clientX, clientY } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({ stv: this.data.stv })
  },
  handlerMove(e) {
    let { clientX, clientY } = e.touches[0];
    let { stv } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.navbarCount - 1)) {
      stv.offset = stv.windowWidth * (this.navbarCount - 1);
    }
    this.setData({ stv: stv });
  },
  handlerCancel(e) {

  },
  handlerEnd(e) {
    let { clientX, clientY } = e.changedTouches[0];
    let endTime = e.timeStamp;
    let { navbar, stv, currentTab } = this.data;
    let { offset, windowWidth } = stv;
    var dragDistance = this.tapStartX - clientX;

    var isVertical = false;
    if (Math.abs(this.tapStartY - clientY) > 60){
      isVertical = true;
    }
    console.log("Y: " +Math.abs(this.tapStartY - clientY))
    console.log("X: " + dragDistance);

    if (!isVertical && Math.abs(dragDistance) > 20 && dragDistance < 0 && currentTab > 0) {
      currentTab--;
    } else if (!isVertical && Math.abs(dragDistance) > 30 && dragDistance > 0 && currentTab < (navbar.length -1)){
      currentTab++;
    }

    this.setData({ currentTab: currentTab });

    stv.offset = stv.windowWidth * currentTab;
    stv.tStart = false;
    this.setData({ stv: this.data.stv });
  },

  onLoad: function (options) {
    that = this;
    that._initNavbar();

    return;
    wx.showLoading({title: '数据加载中...', mask: true});
    //推荐频道 热门歌单
    util.getRecommend(function (data) {
      wx.hideLoading();
      that.setData({slider: data.data.slider, radioList: data.data.radioList, songList: data.data.songList});
    });
    
    //搜索频道 热门搜索
    util.getHotSearch(function (data) {
      that.setData({hotkey: data.data.hotkey, special: data.data.special_key});
    });
    // 设置search 结果scrollview的高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollviewH: res.windowHeight - 90
        });
      }
    });
  },
  // 搜索取消
  onSearchCancel: function () {
    that.setData({
      searchKeyword: '',
    });
  },
  // 搜索输入值时的操作
  onSearchInput: function (ev) {
    that.setData({searchKeyword: ev.detail.value});
  },
  // 滚动分页加载
  onScrollLower: function () {
    if (that.data.scrollFlag) {
      var num = that.data.searchPageNum + 1;
      var total = Math.ceil(that.data.searchTotalNum / that.data.searchPageSize);
      if (num > total) {
        that.setData({searchLoadingComplete: true});
        return;
      } else {
        if (num == total) {
          that.setData({searchLoading: true});
        } else {
          that.setData({searchLoading: false});
        }
        that.setData({searchPageNum: num});
        that.onFetchSearchList(that.data.searchPageNum);
      }
    }
  },
  // 滚动计算滚动条距离
  onScroll: function (ev) {
    var scrollTop = ev.detail.scrollTop;
    if (scrollTop > 500) {
      that.setData({backToTop: true});
    } else {
      that.setData({backToTop: false});
    }
  },

  // 跳转到cdlist
  onCdlistTap: function (ev) {
    var id = ev.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../cdlist/cdlist?cdListId=' + id
    });
  },
  // 搜索结果跳到播放页
  onPlaysongTap: function (ev) {
    app.setGlobalData({songData: ev.currentTarget.dataset.data});
    var id = ev.currentTarget.dataset.id;
    var mid = ev.currentTarget.dataset.mid;
    var albummid = ev.currentTarget.dataset.albummid;
    var songFrom = ev.currentTarget.dataset.from;
    wx.navigateTo({
      url: '../playsong/playsong?id=' + id + '&mid=' + mid + "&albummid=" + albummid + '&songFrom=' + songFrom
    });
  }

});
