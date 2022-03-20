Component({
  properties: {
    showDialog: {
      type: Boolean,
      value: true
    },
    exactTime:{
      type: String,
      value: true
    },
    dateIndex:{
      type: String,
      value: true
    },
  },
  // options: {
  //   addGlobalClass: true,
  // },
  data: {

  },
  methods: {
    hideShareDialog () {
      this.triggerEvent('hideDialog')
    },
    // shareToFriends () {
    //   this.triggerEvent('shareToFriends')
    // },
    noMove(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    handleSave() {
      const { exactDate, dateIndex, exactTime } = this.data;
      this.triggerEvent('handleSave', { exactDate, dateIndex, exactTime })
    },



    bindPickerChange: function (e) {
      const currentData = e.detail.value;
      const { exactTime } = this.data;
      const time = (currentData + " " + exactTime).split(/[- : \/]/);
      const exactDate = new Date(
        time[0],
        time[1] - 1,
        time[2],
        time[3],
        time[4],
        "00"
      ).getTime();
      this.setData({
        dateIndex: currentData,
        exactDate: exactDate,
      });
    },
  
    /**
     * 时间选择器
     */
    bindTimeChange: function (e) {
      const exactTime = e.detail.value;
      const { dateIndex } = this.data;
      const time = (dateIndex + " " + exactTime).split(/[- : \/]/);
      const exactDate = new Date(
        time[0],
        time[1] - 1,
        time[2],
        time[3],
        time[4],
        "00"
      ).getTime();
      this.setData({
        exactTime,
        exactDate: exactDate,
      });
    },
  },
})