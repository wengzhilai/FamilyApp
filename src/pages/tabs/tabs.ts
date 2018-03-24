import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular';
import { Platform, ModalController, NavController } from 'ionic-angular';
import { CommonService } from "../../Service/Common.Service";

import { Config } from "../../Classes/Config";
import { JPush } from 'ionic3-jpush';
import { AppGlobal } from "../../Classes/AppGlobal";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('myTabs') tabs: Tabs;
  config = Config;
  chatParams = {
    root: 'true'
  };
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public jPush: JPush,
    public platform: Platform,
    public commonService: CommonService,

  ) {

    console.log("开户首页订阅");
    // Config.homeSubscribeNotification = true;
    // this.JPushNotification();
  }

  ionViewDidEnter() {

  }

  JPushNotification() {
    if ((this.platform.is('android') || this.platform.is('ios')) && !Config.homeMarkNotification) {
      Config.homeMarkNotification = true
      //打开推送信息
      this.jPush.openNotification().subscribe((v: any) => {
        if (Config.homeSubscribeNotification) {
          console.log('监听到Tabs的推送信息');
          this.JPushNotificationHandle(v)
        }
      })
    }
  }
  JPushNotificationHandle(obj): Promise<any> {
    console.log('Tabs加载推送');
    try {
      console.log(JSON.stringify(obj));
    }
    catch (e) {
      console.log(obj);
    }
    let nowTodo = obj.extras
    if (nowTodo == null) { nowTodo = obj['cn.jpush.android.EXTRA'] }
    if (nowTodo == null) {
      console.log("没找到参数：extras和cn.jpush.android.EXTRA")
      this.commonService.hint("没找到参数：extras和cn.jpush.android.EXTRA:"+JSON.stringify(obj))
      return Promise.resolve();
    }
    let isExist = false;
    let loginName = AppGlobal.CooksGet("loginName")
    if (nowTodo.UserNames != null && loginName != null && loginName != "") {
      let allUserList:Array<string> = nowTodo.UserNames.split(',')
      for (let index = 0; index < allUserList.length; index++) {
        const element = allUserList[index];
        if (element.toLowerCase() == loginName.toLowerCase()) {
          isExist = true
        }
      }
    }
    else {
      isExist = true
    }
    if (isExist) { //是否允许该用户操作
      switch (nowTodo.PageName) {
        case "TodoPropertySingleOnePage":
          let propertyId = nowTodo.PropertyId
          if (propertyId == null) {
            console.log(nowTodo)
            console.log("没找到参数：PropertyId")
            this.commonService.hint("没找到参数：" + propertyId)
            return Promise.resolve();
          }
          AppGlobal.SetPropertyId(propertyId); //保存物业
          return this.navCtrl.push(nowTodo.PageName, { model: nowTodo, prodertyId: propertyId, pushType: "jpush" })
        default:
          return this.navCtrl.push(nowTodo.PageName)
      }

    }
    else {
      this.commonService.hint("该通知只能被[" + nowTodo.UserNames + "]处理,而您是[" + loginName + "]")
      return Promise.resolve();
    }
  }

  /**
   * 是否有待办,自动打开待办事
   */
  AutoOpenTodo() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      console.log("开始自动打开")
        try {
          if (AppGlobal.jpushArrMsg!=null && AppGlobal.jpushArrMsg.length > 0) {
            this.JPushNotificationHandle(AppGlobal.jpushArrMsg[0])
            //删除已经推送成功的
            AppGlobal.jpushArrMsg.splice(0, 1);
            return true
          }
          return false
        } catch (e) {
          console.log("解释错误：" + JSON.stringify(e))
          return false;
        }
      }
  }

  changeTabs(i) {

    let activeNav = this.tabs.getSelected();
    let indx = activeNav.index;
    this.tabs.select(indx)

    // let activeVC = this.nav.getActive();
    // let page = activeVC.instance;
    // let tabs = page.tabs; //一定要在TabsPage页面上添加 @ViewChild('myTabs') tabs: Tabs;
    // console.log(activeVC.name)


    setTimeout(() => {
      this.AutoOpenTodo()
    }, 5000);
  }
}
