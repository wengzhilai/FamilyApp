import { CommonService } from "../../../Service/Common.Service";
import { ToPostService } from "../../../Service/ToPost.Service";
import { NavController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import { Component, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Config } from "../../../Classes/Config";

@IonicPage()
@Component({
  selector: 'page-user-reg',
  templateUrl: 'user-reg.html',
})
export class UserRegPage {
  loadTimeBirthday: Date = new Date("1900-1-1");
  para: Array<any> = [];
  fatherIsTrue: boolean = false;
  fatherLabel: string = "您父亲姓名";
  fatherName: string = "";


  userForm: FormGroup;
  validateMessages: any;
  timer: any;
  formErrors: any = {};
  bean = {
    loginName: '',
    userName: '',
    password: '',
    // version: Config.version,
    code: '',
    type: '0',
    BIRTHDAY_TIME: '',
    BirthdayTimeChinese: ''

  }

  lunlarDate=""
  solarDate=""
  constructor(private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public commonService: CommonService,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public toPostService: ToPostService) {
    this.userForm = this.formBuilder.group({
      loginName: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      userName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(11)]],
      code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      password: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(11)]],
      level_id: [''],
      sex: [''],
      birthday_place: [''],
    });
    this.validateMessages = {
      'loginName': { 'aliasName': '登录名' },
      'code': { 'aliasName': '短信验证码' },
      'userName': { 'aliasName': '姓名' },
      'pollCode': { 'aliasName': '推荐码' },
      'password': { 'aliasName': '密码' },
      'level_id': { 'aliasName': '排行' },
      'sex': { 'aliasName': '性别' },
      'birthday_place': { 'aliasName': '出生地' },
    };
  }


  sendCodeDisabled = false;
  sendCodeText = "发送验证码"
  i = 0
  SetTimeValue() {
    if (this.i > 0) {
      this.i--
      this.sendCodeText = this.i + "秒";
      setTimeout(() => { this.SetTimeValue() }, 1000);
    }
    else {
      this.sendCodeDisabled = false;
      this.sendCodeText = "发送验证码"
    }
  }
  SendCode($event) {
    const control = this.userForm.get("loginName")
    console.log(control);
    if ((control && control.dirty && !control.valid) || control.value=='') {
      this.commonService.hint('电话号码无效!')
      return;
    }
    this.sendCodeDisabled = true;
    this.sendCodeText = "60秒";
    this.i = 60;
    this.SetTimeValue();
    this.toPostService.Post("Public/SendCode", { "Data": { "phoneNum": control.value } }, (currMsg) => {
      if (currMsg.IsError) {
        this.commonService.hint(currMsg.Message)
      } else {
        this.commonService.showLongToast("发送成功");
      }
    })

  }

  SubmitFather() {
    var postBean: any = {
      Data: { "name": this.fatherName }
    }
    this.toPostService.Post("UserInfo/SingleByName", postBean, (currMsg) => {
      if (currMsg.IsError) {
        this.commonService.hint(currMsg.Message)
      } else {
        if (currMsg.Data.length == 0) {
          this.para.push({ "V": this.fatherName })
          this.fatherLabel = '请输入' + this.fatherName + "的父亲";
          this.fatherName = '';
        }
        else {
          let alert = this.alertCtrl.create();
          if (this.para.length == 0) {
            alert.setTitle('选择您的父亲');
          }
          else {
            alert.setTitle('选择' + this.para[this.para.length - 1].V + '的父亲');
          }
          for (let index = 0; index < currMsg.Data.length; index++) {
            const element = currMsg.Data[index];
            alert.addInput({
              type: 'radio',
              label: element.FatherName + "=>" + element.NAME,
              value: element.ID + "|" + element.NAME,
              checked: false
            });
          }

          alert.addInput({
            type: 'radio',
            label: '都不是',
            value: '0',
            checked: false
          });
          alert.addButton('取消');
          alert.addButton({
            text: '确定',
            handler: data => {
              if (data != '0') {
                var tmpArr = data.split('|')
                this.para.push({ "V": tmpArr[1], K: tmpArr[0] })
                this.fatherIsTrue = true;
                console.log(this.para);
              }
              else {
                this.para.push({ "V": this.fatherName })
                this.fatherLabel = '请输入' + this.fatherName + "的父亲";
                this.fatherName = '';
                console.log(this.para);
              }
            }
          });
          alert.present();
        }
      }
    })
  }

  submit() {
    if (this.userForm.invalid) {
      this.formErrors = this.commonService.FormValidMsg(this.userForm, this.validateMessages);
      let errMsg = "";
      for (const field in this.formErrors) {
        if (this.formErrors[field] != '') {
          errMsg += "<p>" + this.formErrors[field] + "</p>"
        }
      }
      this.commonService.hint(errMsg, '输入无效')
      return;
    }
    console.log(this.userForm.value)
    // this.bean=this.userForm.value
    for (var key in this.userForm.value) {
      this.bean[key] = this.userForm.value[key];
    }

    // this.toPostService.Post("UserInfo/UserInfoReg", this.bean, (currMsg) => {
    //   if (currMsg.IsError) {
    //     this.commonService.hint(currMsg.Message)
    //   } else {
    //     this.commonService.hint("注册成功");
    //     this.navCtrl.pop();
    //   }
    // })
  }
  reset() {
    this.userForm.reset();
  }
  GoBack() {
    this.navCtrl.pop();
  }

  DoneBirthdayTime(inDate: any){
    let dataStr=inDate.substr(0, inDate.indexOf('T'))
    let alert = this.alertCtrl.create({
      title: '日期类型',
      message:"选择的时间为："+dataStr,
      buttons: [
        {
          text: '农历',
          handler: () => {
            this.lunlarDate=dataStr
            this.solarDate=""
            this.toPostService.Post("Public/GetSolarDate", {Data: { "Data": dataStr }}, (currMsg) => {
              if (currMsg.IsSuccess) {
                this.solarDate=currMsg.Msg
              }
            });
          }
        },
        {
          text: '阳历',
          handler: () => {
            this.solarDate=dataStr
            this.lunlarDate=""
            this.toPostService.Post("Public/GetLunarDate", {Data: { "Data": dataStr }}, (currMsg) => {
              if (currMsg.IsSuccess) {
                this.lunlarDate=currMsg.Msg
              }
            });
          }
        }
      ]
    });
    alert.present();
  }


}
