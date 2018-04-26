//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topList: [],
    titleType: {
      hot: '热门书籍',
      recommend: '推荐书籍',
      search: '搜索结果',
      my: '我的书籍',
      history: '收听历史'
    }
  },

  // 动态设置标题
  _setTitle: function(queryType){
    var that = this;
    var title = '书籍列表';
    if (queryType && that.data.titleType[queryType] ){
      title = that.data.titleType[queryType];
    }

    wx.setNavigationBarTitle({
      title: title
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that._setTitle(options.type ? options.type : '');

    //获取列表数据
    util.getToplist(function (data) {
      // 过滤巅峰mv榜
      that.setData({
        topList: data.filter((item, i) => item.id != 201)
      });
    });
  },

  // 跳到到详情
  onToplistTap: function (ev) {
    var id = ev.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../toplist/toplist?topListId=' + id
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})