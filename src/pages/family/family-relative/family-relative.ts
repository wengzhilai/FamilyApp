
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, App, FabContainer,AlertController } from 'ionic-angular';

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
export class FamilyRelativePage implements OnInit  {
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
    this.onSucc(1);
  }
  ngOnInit() {
    this.graph = new NetronGraph(this.mapElement.nativeElement);
    this.graph.theme = {
      background: "#fafafa",
      connection: "#000",
      selection: "#888",
      connector: "#777",
      connectorBorder: "#000",
      connectorHoverBorder: "#000",
      connectorHover: "#0c0"
    };
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
  onSucc(postUserId) {

    this.userId = postUserId;
    this.toPostService.Single("Family/UserInfoRelative", postUserId, (currMsg) => {
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

      if (element.Object.Id == this.userId) {
        context.fillStyle = "#c8d4e8";
        context.strokeStyle = element.selected ? "#666" : "#F00";
      }
      else {
        context.fillStyle = "#fff";
        context.strokeStyle = element.selected ? "#444" : "#000";
      }
      context.lineWidth = element.selected ? 2 : 1;
      context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      context.font = "10px Verdana";
      context.fillStyle = context.strokeStyle;
      context.textBaseline = "bottom";
      context.textAlign = "center";
      for (var i = 0; i < element.content.length; i++) {
        context.fillText(element.content[i], rectangle.x + (rectangle.width / 2), rectangle.y + 20 + (20 * i));
      }
    },
    edit: (element: NetronElement, context, point: any) => {
      this.tempCheckUser = element.Object;

      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.display = ""
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.left = (element.rectangle.x - 15) + "px"
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.top = (element.rectangle.y + 15) + "px"
      this.fab.toggleList();
    }
  }

  public contentEditor = {
    input: null,
    start: function (element, context) {
      this.element = element;
      this.canvas = context.canvas;

      var rectangle = element.rectangle;
      rectangle.x += this.canvas.offsetLeft;
      rectangle.y += this.canvas.offsetTop;

      this.input = document.createElement('input');
      this.input.type = "text";
      this.input.style.position = "absolute";
      this.input.style.zIndex = 1;
      this.input.style.top = (rectangle.y + 8) + "px";
      this.input.style.left = (rectangle.x + 2) + "px";
      this.input.style.width = (rectangle.width - 5) + "px";
      this.input.onblur = function (e) {
        this.commit();
      }
      this.input.onkeydown = function (e) {
        if (e.keyCode == 13) { this.commit(); } // Enter
        if (e.keyCode == 27) { this.cancel(); } // ESC
      };
      this.canvas.parentNode.appendChild(this.input);
      this.input.value = element.content;
      this.input.select();
      this.input.focus();
    },
    commit: function () {
      this.element.setContent(this.input.value);
      this.cancel();
    },
    cancel: function () {
      if (this.input !== null) {
        var input = this.input;
        this.input = null;
        this.canvas.parentNode.removeChild(input);
        this.canvas = null;
      }
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
    this.navCtrl.push("FamilyEditFatherPage",
      {
        optype: "edit",
        userId: this.userId,
        userName: this.userName
      });
  }
  DeleteUserInfo() {
    let alert = this.alertCtrl.create({
      title: '删除用户',
      message: '确定要删除该用户['+this.tempCheckUser.Name+']吗',
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
              authToken: AppGlobal.GetToken(),
              id: this.tempCheckUser.Id
            };
            this.toPostService.Post("UserInfo/UserInfoDelete", postBean, (currMsg) => {
              if (currMsg.IsError) {
                this.commonService.hint(currMsg.Message);
              } else {
                this.commonService.hint('删除成功');
                this.LookRelative()
              }
            })
          }
        }
      ]
    });
    alert.present();
  }
  LookRelative() {
    this.fab._mainButton.getElementRef().nativeElement.parentNode.style.left = (-15) + "px"
    this.fab._mainButton.getElementRef().nativeElement.parentNode.style.top = (-15) + "px"

    this.userName = this.tempCheckUser.Name;
    this.userId = this.tempCheckUser.Id;
    this.fab.toggleList();
    this.graph.dispose();
    this.graph = new NetronGraph(this.mapElement.nativeElement);
    this.graph.theme = {
      background: "#fafafa",
      connection: "#000",
      selection: "#888",
      connector: "#777",
      connectorBorder: "#000",
      connectorHoverBorder: "#000",
      connectorHover: "#0c0"
    };
    this.onSucc(this.userId);
  }
  SelectUser(userInfo: any) {
    this.graph.dispose();
    this.graph = new NetronGraph(this.mapElement.nativeElement);
    this.graph.theme = {
      background: "#fafafa",
      connection: "#000",
      selection: "#888",
      connector: "#777",
      connectorBorder: "#000",
      connectorHoverBorder: "#000",
      connectorHover: "#0c0"
    };

    this.CancelKey(null);
    this.onSucc(userInfo.ID)
  }
}
