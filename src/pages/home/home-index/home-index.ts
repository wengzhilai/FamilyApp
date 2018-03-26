import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, App, FabContainer } from 'ionic-angular';

import { NetronGraph } from '../../../Classes/Netron/Graph';
import { NetronElement } from "../../../Classes/Netron/Element";

import { CommonService } from "../../../Service/Common.Service";
import { ToPostService } from "../../../Service/ToPost.Service";
import { FileUpService } from "../../../Service/FileUp.Service";
import { AppGlobal } from "../../../Classes/AppGlobal";

@IonicPage()
@Component({
  selector: 'page-home-index',
  templateUrl: 'home-index.html',
})
export class HomeIndexPage implements OnInit {
  @ViewChild('canvas') mapElement: ElementRef;
  @ViewChild('fab') fab: FabContainer;
  public graph: NetronGraph = null;
  public user: any;
  public userRelative: any;
  constructor(
    public navCtrl: NavController,
    public commonService: CommonService,
    public fileUpService: FileUpService,
    public appCtrl: App,
    public toPostService: ToPostService
  ) {


  }

  onSucc() {
    this.toPostService.Single("Family/UserInfoRelative", {}, (currMsg) => {
      if (!currMsg.IsSuccess) {
        this.commonService.hint(currMsg.Msg);
      } else {
        this.userRelative = currMsg.Data;
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
        let tt:any={}
        for (let i = 0; i < this.userRelative.ItemList.length; i++) {
          let item = this.userRelative.ItemList[i];
          // tt.set["e"+item.ID]=item.ID
          tt["e"+item.ID] = this.graph.addElement(this.personTemplate, { x: item.x * 50 + 100, y: item.y * 100 + 100 }, item.Name, item);
        }
        this.userRelative.RelativeList.forEach(element => {
          this.graph.addConnection(tt["e"+element.K].getConnector("reports"), tt["e"+element.V].getConnector("manager"));
        });
        console.log(tt)
      }
    })
  }

  ngOnInit() {
    if (AppGlobal.GetToken() == null) {
      this.appCtrl.getRootNav().push('UserLoginPage');
    }
    else {
      this.onSucc();
      // this.test()
    }
  }

  test() {
    // this.graph = new NetronGraph(this.mapElement.nativeElement);
    
    // this.graph.theme = {
    //   background: "#fafafa",
    //   connection: "#000",
    //   selection: "#888",
    //   connector: "#777",
    //   connectorBorder: "#000",
    //   connectorHoverBorder: "#000",
    //   connectorHover: "#0c0"
    // };
    // var e1 = this.graph.addElement(this.personTemplate, { x: 250, y: 50 }, "Michael Scott",{});
    // var e2 = this.graph.addElement(this.personTemplate, { x: 150, y: 150 }, "Angela Martin",{});
    // var e3 = this.graph.addElement(this.personTemplate, { x: 350, y: 150 }, "Dwight Schrute",{});
    // var e4 = this.graph.addElement(this.personTemplate, { x: 50, y: 250 }, "Kevin Malone",{});
    // var e5 = this.graph.addElement(this.personTemplate, { x: 250, y: 250 }, "Oscar Martinez",{});
    // this.graph.addConnection(e1.getConnector("reports"), e2.getConnector("manager"));
    // this.graph.addConnection(e1.getConnector("reports"), e3.getConnector("manager"));
    // this.graph.addConnection(e2.getConnector("reports"), e4.getConnector("manager"));
    // this.graph.addConnection(e2.getConnector("reports"), e5.getConnector("manager"));
    // this.graph.update();
  }

  public personTemplate = {
    resizable: false,
    defaultWidth: 20,
    defaultHeight: 80,
    defaultContent: "asdfasdfag",
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

      context.fillStyle = "#fff";
      context.strokeStyle = element.selected ? "#444" : "#000";
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
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.display = ""
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.left = (element.rectangle.x - 15) + "px"
      this.fab._mainButton.getElementRef().nativeElement.parentNode.style.top = (element.rectangle.y + 15) + "px"
      this.fab.toggleList();
      // console.log(point)
      // console.log(this.fab)
      // this.fab._mainButton.getElementRef().nativeElement.parentNode.style.left = 
      // this.fab._mainButton.getElementRef().nativeElement.parentNode.style.top = point.y
      // console.log(this.fab._mainButton.getElementRef().nativeElement.parentNode.style.left = point.x);
      //this.contentEditor.start(element, context);
      //this.commonService.hint(context);
    }
  }

  public contentEditor =
    {
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
}