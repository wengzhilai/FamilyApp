import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { YearPicker } from "../../../Classes/YearPicker"
import { FileUpService } from "../../../Service/FileUp.Service";
import { CommonService } from "../../../Service/Common.Service";
import { ToPostService } from "../../../Service/ToPost.Service";


@IonicPage()
@Component({
  selector: 'page-family-edit',
  templateUrl: 'family-edit.html',
})

/**
 * 参数：
 * optype(EditFather/addSon/edit):表示操作类型
 * userId:操作用户的ID
 * userName:操作用户的名称，主要用于显示标题
 */
export class FamilyEditPage {
  /** 多语言 */
  public i18n = "family-edit"
  /** 表单 */
  userForm: FormGroup;

  /** 年份开始时间 用于计算非公元年的 */
  public yeasStart
  /** 设置时间选择对象 */
  yearPicker: any = YearPicker;


  BirthdaylunlarDate
  BirthdaysolarDate

  bean: any = {
    YEARS_TYPE: "阳历",
    SEX: "男",
    IS_LIVE: 1,
    LEVEL_ID: 1,
    DIED_TIME: new Date().toISOString(),
    BIRTHDAY_TIME: new Date().toISOString()
  };
  title: string = "添加用户"

  constructor(
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public alerCtrl: AlertController,
    public params: NavParams,
    public fileUpService: FileUpService,
    public commonService: CommonService,
    public toPostService: ToPostService

  ) {
    console.log(typeof (this))
  }

  SetForm(inEnt) {
    this.userForm = this.formBuilder.group({
      firstName: [(inEnt.NAME == null || inEnt.NAME.length < 1) ? "" : inEnt.NAME.substr(0, 1), [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      lastName: [(inEnt.NAME == null || inEnt.NAME.length < 2) ? "" : inEnt.NAME.substr(1), [Validators.required, Validators.minLength(1), Validators.maxLength(4)]],
      SEX: [inEnt.SEX, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      LEVEL_ID: [inEnt.LEVEL_ID, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      BIRTHDAY_PLACE: [inEnt.BIRTHDAY_PLACE, [Validators.minLength(0), Validators.maxLength(200)]],
      DIED_PLACE: [inEnt.DIED_PLACE, [Validators.minLength(0), Validators.maxLength(200)]],
      REMARK: [inEnt.REMARK, [Validators.minLength(0), Validators.maxLength(200)]],
    });
  }

  ngOnInit() {
    console.log(this.i18n);
    this.SetForm(this.bean);
  }

  ionViewDidLoad() {
    console.log(this.params);
    this.toPostService.Post("UserInfo/Single", { "Key": this.params.get("userId") }).then((currMsg) => {
      if (!currMsg.IsSuccess) {
        this.commonService.hint(currMsg.Msg)
        this.navCtrl.pop();
      }
      else {
        this.bean = currMsg.Data;
        this.SetForm(this.bean);
      }
    })
    this.title = "修改[" + this.params.get("userName") + "]的资料";
  }
  upImg(key) {

  }

  save() {
    if (this.userForm.invalid) {
      let formErrors = this.commonService.FormValidMsg(this.userForm, this.i18n);
      console.log(formErrors);
      this.commonService.hint(formErrors.ErrorMessage, '输入无效')
      return;
    }
    for (var key in this.userForm.value) {
      this.bean[key] = this.userForm.value[key];
    }
    this.bean.NAME = this.bean.firstName + this.bean.lastName;
    console.log(this.bean)

  }



  /**
   * 设置时间类型
   */
  SetOptions() {
    let alert = this.alerCtrl.create({});
    alert.setTitle('设置时间类型');
    YearPicker.yeasGroup.forEach(element => {
      alert.addInput({
        type: 'radio',
        label: element.name,
        value: element.name + "|" + element.value,
        checked: element.name == this.bean.YEARS_TYPE
      });
    });

    alert.addButton('取消');
    alert.addButton({
      text: '确定',
      handler: data => {
        var dataArr = data.split('|')
        this.bean.YEARS_TYPE = dataArr[0];
        this.yeasStart = dataArr[1];
      }
    });
    alert.present();
  }

  DoneBirthdayTime(inDate: any) {
    let dataStr = inDate.substr(0, inDate.indexOf('T'))
    if (this.bean.YEARS_TYPE == "阳历") {
      this.BirthdaylunlarDate = dataStr
      this.BirthdaysolarDate = ""
      this.toPostService.Post("Public/GetSolarDate", { Data: { "Data": dataStr } }, (currMsg) => {
        if (currMsg.IsSuccess) {
          this.BirthdaysolarDate = currMsg.Msg
        }
      });
    } else {
      this.BirthdaysolarDate = dataStr
      this.BirthdaylunlarDate = ""
      this.toPostService.Post("Public/GetLunarDate", { Data: { "Data": dataStr } }, (currMsg) => {
        if (currMsg.IsSuccess) {
          this.BirthdaylunlarDate = currMsg.Msg
        }
      });
    }

  }
}
