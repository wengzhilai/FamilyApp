
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, App, FabContainer, AlertController } from 'ionic-angular';

import { NetronGraph } from '../../../Classes/Netron/Graph';
import { NetronElement } from "../../../Classes/Netron/Element";

import { CommonService } from "../../../Service/Common.Service";
import { ToPostService } from "../../../Service/ToPost.Service";
import { FileUpService } from "../../../Service/FileUp.Service";

import { AppGlobal } from "../../../Classes/AppGlobal";
import { Dictionary } from "../../../Classes/Dictionary";


@IonicPage()
@Component({
  selector: 'page-family-relative',
  templateUrl: 'family-relative.html',
})
export class FamilyRelativePage implements OnInit {
  @ViewChild('canvas') mapElement: ElementRef;
  @ViewChild('fab') fab: FabContainer;
  public graph: NetronGraph = null;
  public userId: number;
  public userName: string;
  public tempCheckUser: any;
  public userRelative: any;
  public allRelative: Dictionary = new Dictionary();
  public userInfoList: any;
  constructor(
    public navCtrl: NavController,
    public commonService: CommonService,
    public fileUpService: FileUpService,
    private alertCtrl: AlertController,
    public toPostService: ToPostService
  ) {
    this.onSucc();
  }
  ngOnInit() {
    this.graph = new NetronGraph(this.mapElement.nativeElement);
    this.graph.ClickBlack=(x)=>{
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.display = "none"
    }
  }

  CancelKey(ev: any) {
    this.userInfoList = [];
  }
  filterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() !== '') {
      var postBean = {
        para: [{ K: "keyWord", V: val.trim() }]
      }
      this.toPostService.Post("UserInfo/UserInfoList", postBean, (currMsg) => {
        if (currMsg.IsError) {
          this.commonService.hint(currMsg.Message);
        }
        else {
          if (currMsg.totalCount > 1) {
            this.userInfoList = currMsg.data;
          }
          else if (currMsg.totalCount == 1) {
            this.userInfoList = [];
            this.userName = currMsg.data[0].NAME;
            this.SelectUser(currMsg.data[0])
          }
          else {
            this.userInfoList = [];
          }
        }
      })
    }
    else {
      this.userInfoList = [];
    }
  }
  onSucc(postUserId=null) {

    this.userId = postUserId;
    
    this.toPostService.Post("Family/UserInfoRelative", {Key:postUserId}, (currMsg) => {
      if (!currMsg.IsSuccess) {
        this.commonService.hint(currMsg.Msg);
      } else {
        this.userRelative = currMsg.Data;

        for (var i = 0; i < this.userRelative.ItemList.length; i++) {
          var item = this.userRelative.ItemList[i];
          var e1 = this.graph.addElement(this.personTemplate, { x: item.x * 15 + 20, y: item.y * 90 + 50 }, item.Name, item);
          this.allRelative.add(item.Id, e1);
        }
        var allR = this.allRelative.toLookup();
        this.userRelative.RelativeList.forEach(element => {
          if (allR[element.V] != null && allR[element.K] != null) {
            this.graph.addConnection(allR[element.V].getConnector("reports"), allR[element.K].getConnector("manager"));
          }
        });
      }
    })
  }





  public personTemplate = {
    resizable: false,
    defaultWidth: 20,
    defaultHeight: 70,
    defaultContent: "",
    connectorTemplates: [
      {
        name: "manager",
        type: "Person [in]",
        description: "Manager",
        getConnectorPosition: (element) => {
          return {
            x: Math.floor(element.rectangle.width / 2),
            y: 0
          }
        }
      },
      {
        name: "reports",
        type: "Person [out] [array]",
        description: "Reports",
        getConnectorPosition: (element) => {
          return {
            x: Math.floor(element.rectangle.width / 2),
            y: element.rectangle.height
          }
        }
      }
    ],
    paint: (element, context) => {
      var rectangle = element.rectangle;
      rectangle.x += context.canvas.offsetLeft;
      rectangle.y += context.canvas.offsetTop;
      //表示是自己
      if (element.Object.Id == this.userId) {
        context.fillStyle = "#c8d4e8";
        context.strokeStyle = element.selected ? "#666" : "#F00";
      }
      else {
        context.fillStyle = "#fff";
        context.strokeStyle = element.selected ? "#444" : "#000";
      }
      if (element.selected) {
        context.lineWidth = 5
      }
      else {
        context.lineWidth = 1
      }
      //画背景色
      context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      //画边框
      context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      context.font = "12px Verdana";
      context.fillStyle = context.strokeStyle;
      context.textBaseline = "bottom";
      context.textAlign = "center";
      for (var i = 0; i < element.content.length; i++) {
        context.fillText(element.content[i], rectangle.x + (rectangle.width / 2), rectangle.y + 20 + (20 * i));
      }
    },
    edit: (element: NetronElement, context, point: any) => { //点击事件
      this.tempCheckUser = element.Object;
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.display = ""
    }
  }

  EditFather() {
    this.userName = this.tempCheckUser.Name;
    this.userId = this.tempCheckUser.Id;
    this.fab.toggleList();
    this.navCtrl.push("FamilyEditFatherPage",
      {
        optype: "EditFather",
        userId: this.userId,
        userName: this.userName
      });
  }
  AddSon() {
    this.userName = this.tempCheckUser.Name;
    this.userId = this.tempCheckUser.Id;
    this.fab.toggleList();
    this.navCtrl.push("FamilyEditFatherPage",
      {
        optype: "addSon",
        userId: this.userId,
        userName: this.userName
      });
  }
  AddAllSon() {
    this.userName = this.tempCheckUser.Name;
    this.userId = this.tempCheckUser.Id;
    let alert = this.alertCtrl.create({
      title: '批量添加子女',
      message: '批量加的用户，默认性别:男',
      inputs: [
        {
          name: 'userNameArrStr',
          placeholder: '多个用户用逗号分开，无需填写姓'
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '添加',
          handler: data => {
            console.log(data.userNameArrStr)
            var postBean = {
              authToken: AppGlobal.GetToken(),
              userId: this.userId,
              entity: data.userNameArrStr
            };
            this.toPostService.Post("UserInfo/UserInfoAddMultiSon", postBean, (currMsg) => {
              if (currMsg.IsError) {
                this.commonService.hint(currMsg.Message);
              } else {
                this.commonService.hint('成功添加' + currMsg + '个用户', '添加成功');
                this.LookRelative()
              }
            })
          }
        }
      ]
    });
    alert.present();
  }

  EditUserInfo() {
    this.userName = this.tempCheckUser.Name;
    this.userId = this.tempCheckUser.Id;
    this.fab.toggleList();
    this.navCtrl.push("FamilyEditPage",
      {
        optype: "edit",
        userId: this.userId,
        userName: this.userName
      });
  }
  DeleteUserInfo() {
    let alert = this.alertCtrl.create({
      title: '删除用户',
      message: '确定要删除该用户[' + this.tempCheckUser.Name + ']吗',
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '删除',
          handler: data => {
            var postBean = {
              Key: this.tempCheckUser.Id
            };
            this.toPostService.Post("UserInfo/Delete", postBean, (currMsg) => {
              if (currMsg.IsSuccess) {
                this.commonService.hint('删除成功');
                this.tempCheckUser.Name=""
                this.tempCheckUser.Id=""
                this.LookRelative()
              } else {
                this.commonService.hint(currMsg.Msg);
              }
            })
          }
        }
      ]
    });
    alert.present();
  }
  LookRelative() {
    this.userName = this.tempCheckUser.Name;
    this.userId = this.tempCheckUser.Id;
    this.graph.dispose();
    this.graph = new NetronGraph(this.mapElement.nativeElement);
    this.onSucc(this.userId);
  }
  SelectUser(userInfo: any) {
    this.graph.dispose();
    this.graph = new NetronGraph(this.mapElement.nativeElement);

    this.CancelKey(null);
    this.onSucc(userInfo.ID)
  }
}
