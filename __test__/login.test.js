const wd = require("wd");
const driver = wd.promiseChainRemote("http://127.0.0.1:4723/wd/hub/");
const asserters = wd.asserters;
const structure = require("../commons/structure.json");
const {
  login,
  openSettings,
  findIosElement,
  waitForTwoElementUntilAppears,
  waitForElementUntilAppear,
  waitForElementUntilDisappear,
  loginSetCredentials,
  waitForElementUntilDisappearByXPath
} = require("../commons/commonsFunctions");
const api = require("../api/api");

const userTest = [
  { email: "ledr1993+delivery01@gmail.com", password: "Abc123." },
  { email: "ledr1993+gc8@gmail.com", password: "Abc123." },
];

const caps = {
  platformName: "iOS",
  platformVersion: "15.4",
  deviceName: "iPhone 12 Pro",
  automationName: "XCUITest",
  bundleId: "com.moocho.moocho",
  noReset: true,
  includeSafariInWebviews: true,
  newCommandTimeout: 3600,
  connectHardwareKeyboard: true,
};

jest.setTimeout(90 * 1000);

beforeAll(async () => {
  await driver.init(caps);
});

afterAll(async () => {
  await driver.quit();
});

describe("Login Test Success", () => {

    beforeEach(async () => {   
      /*CLEAR USER STATUS*/        
      await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})      
      })

    afterEach(async () => {          
        let elementDisplayed = await waitForTwoElementUntilAppears(structure.dashboardActivity.dashboard,structure.creditCardActivity.creditCardScreen,driver)      
      
        if(elementDisplayed === structure.creditCardActivity.creditCardScreen){
            let skipCreditCardScreen = await driver.elementById(structure.creditCardActivity.skipBtn)
            await skipCreditCardScreen.click()
        }          
        //await for dashboard  
        await driver.waitForElementById(structure.dashboardActivity.dashboard, asserters.isDisplayed, 60000, 100);                
        await waitForElementUntilDisappear(structure.dashboardActivity.loadingScreen, driver);          
        /*OPENING SETTINGS*/
        await openSettings(driver, asserters);            
        /*LOGOUT ACCOUNT*/
        let btnLogOut = await driver.elementById(structure.profileActivity.logOutBtn);
        await btnLogOut.click();
        await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);

      })
    //1  
    test.skip("[Success] Log In — SMS autofill", async () => {
      console.log("1. [Success] Log In — SMS autofill")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);

      /*login set data and go*/
      await loginSetCredentials(driver, asserters, userTest[0].email, userTest[0].password);

    });
    //2
    test("[Success] Log In — SMS manual fill", async () => {
      console.log("2. [Success] Log In — SMS manual fill")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click();

      //await for 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      //set 2fa code 2 digits and clear
      let setTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)
      await setTwofaCode.sendKeys(1234)
      await setTwofaCode.clear()

      //get 2fa real code
      let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})
      await setTwofaCode.sendKeys(twoFaCode[0].validation_token)

      //if 2fa code is correct 2fa screen disappears  
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

    });
    //3
    test("[Success] Log In — Resend Code to SMS", async () => {
      console.log("3. [Success] Log In — Resend Code to SMS")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click();

      //await for 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      //get 2fa old code
      let twoFaCodeOldCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})
      
      //click on resend code
      let resendButton = await driver.elementById(structure.twoFaActivity.twofaViewControllerResendCodeBtn)
      await resendButton.click()

      //await for code send message
      await waitForElementUntilAppear("We sent you a new code. Any old codes are no longer valid.",driver)
      let alertBtnOkay = await driver.elementById("Okay")
      await alertBtnOkay.click()      

      //set 2FA INPUT
      let inputTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)
      
      //await 5 seconds for new code
      await new Promise(resolve => setTimeout(resolve, 5000));

      //set old code
      await inputTwofaCode.sendKeys(twoFaCodeOldCode[0].validation_token)

      //await for again 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      // //get 2fa real code
      let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      await inputTwofaCode.sendKeys(twoFaCode[0].validation_token)

      //if 2fa code is correct 2fa screen disappears  
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

    });
    //4
    test("[Success] Log In — Resend Code to Email", async () => {
      console.log("4. [Success] Log In — Resend Code to Email")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click();

      //await for 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      //get 2fa old code from phone number
      let twoFaCodeOldCodePhoneNumber = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})

      //click on resend code by email
      let resendButtonToEmail = await driver.elementById(structure.twoFaActivity.twofaViewControllerHelpTxt)
      await resendButtonToEmail.click()

      //await for EMAIL code send message
      await waitForElementUntilAppear("We sent a new code to your email. Any old codes are no longer valid.",driver)
      let alertBtnOkay = await driver.elementById("Okay")
      await alertBtnOkay.click()      
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      //await for EMAIL 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      //get 2fa old code from email
      let twoFaCodeOldCodeEmail = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})

      //click on resend code via EMAIL
      let resendButton = await driver.elementById(structure.twoFaActivity.twofaViewControllerResendCodeBtn)
      await resendButton.click()

      //await for code send message
      await waitForElementUntilAppear("We sent you a new code. Any old codes are no longer valid.",driver)
      alertBtnOkay = await driver.elementById("Okay")
      await alertBtnOkay.click()     

      //set 2FA INPUT
      let inputTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)
      
      //await 5 seconds for new code
      await new Promise(resolve => setTimeout(resolve, 5000));

      /**** START: SET OLD CODES ****/

      console.log("SET FIRST CODE SMS - ",twoFaCodeOldCodePhoneNumber[0].validation_token)
      //set first code - old code SMS
      await inputTwofaCode.sendKeys(twoFaCodeOldCodePhoneNumber[0].validation_token)

      //await for again 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      //await 5 seconds for new code
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log("SET FIRST CODE EMAIL - ",twoFaCodeOldCodeEmail[0].validation_token)    
      //set first code - old code Email
      await inputTwofaCode.sendKeys(twoFaCodeOldCodeEmail[0].validation_token)

      //await for again 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

      /**** END: SET OLD CODES ****/
      
      // GET 2fa real code from EMAIL
      let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log("SET CORRECT CODE EMAIL - ",twoFaCode[0].validation_token)    
      await inputTwofaCode.sendKeys(twoFaCode[0].validation_token)

      //if 2fa code is correct 2fa screen disappears  
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

    });
    //5
    test("[Success] Log In — Background App", async () => {
      console.log("5. [Success] Log In — Background App")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click();

      //await for 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);
      //get 2fa old code
      let twoFaCodeOldCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})

      //set app to background
      await driver.backgroundApp(5);

      //set 2FA INPUT
      let inputTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)

      //set  code
      await inputTwofaCode.sendKeys(twoFaCodeOldCode[0].validation_token)

      //if 2fa code is correct 2fa screen disappears  
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

    });
    //6
    test("[Success] Log In — Fraud / Authorized", async () => {
      console.log("6. [Success] Log In — Fraud / Authorized")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);

      /*Change user to IsFraud=1 */
      await api.post(structure.settingsProject.urlBlockAccount,{"email": userTest[0].email,"type": "FRAUD"})

      /*login set data and go*/
      await loginSetCredentials(driver, asserters, userTest[0].email, userTest[0].password);

      //if 2fa code is correct 2fa screen disappears  
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

      /*Change user to IsFraud=0 */
      await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})      

    });
});

describe("Login Test Fail" ,() => {
  
  beforeEach(async () => {
    /*CLEAR USER STATUS*/
    await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})    
  })
    //7
    test("[Failure] Log In — Incorrect Email", async () => {
      console.log("7. [Failure] Log In — Incorrect Email")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys("badEmail@mail.com");

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click();

      //await for UIAlert
      await waitForElementUntilAppear("Okay",driver)
      
      let textFromAlert =  await driver.alertText()
      
      await driver.dismissAlert()

      let backBtn = await driver.elementById(structure.loginActivity.loginViewControllerBackBtn)
      await backBtn.click()

      expect(textFromAlert).toContain(structure.loginActivity.incorrectUserNameOrPasswordMessage)

    });
    //8
    test("[Failure] Log In — Incorrect Password / Lock", async () => {            
      console.log("8. [Failure] Log In — Incorrect Password / Lock")
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys("Abc1234.");

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
          
      let loopFlag = true
      let textFromAlertBox = ""
      let countLoop = 0

      while(loopFlag){
        await logInBtnGo.click();                
        await waitForElementUntilAppear("Okay",driver)
        textFromAlertBox =  await driver.alertText()      
        await driver.dismissAlert()
        loopFlag = (textFromAlertBox === structure.loginActivity.incorrectUserNameOrPasswordMessage)

        if(textFromAlertBox !== structure.loginActivity.incorrectUserNameOrPasswordMessage && textFromAlertBox !== structure.loginActivity.userBlockedMessage ){          
          let backBtn = await driver.elementById(structure.loginActivity.loginViewControllerBackBtn)
          await backBtn.click()
          expect(textFromAlertBox).toContain(structure.loginActivity.incorrectUserNameOrPasswordMessage)
          expect(textFromAlertBox).toContain(structure.loginActivity.userBlockedMessage)
          break;
        }
        countLoop++
      }
            
      await emailField.clear()
      await passwordField.clear()

      await new Promise(resolve => setTimeout(resolve, 2000));

      await emailField.sendKeys(userTest[0].email);
      await passwordField.sendKeys(userTest[0].password);
      await logInBtnGo.click();  

      await waitForElementUntilAppear("Okay",driver)

      let textAlert = await driver.alertText()

      await driver.dismissAlert()

      let backBtn = await driver.elementById(structure.loginActivity.loginViewControllerBackBtn)
      await backBtn.click()

      //validate attemp account 6th attemp should receive pop up
      expect(`${countLoop}th attempt should receive pop up`).toBe(structure.loginActivity.attempsCountLogin)      
      //validate user message blocked
      expect(textAlert).toContain(structure.loginActivity.userBlockedMessage)

    });
    //9
    test("[Failure] Log In — Incorrect 2FA / Lock", async () => {
      console.log("9. [Failure] Log In — Incorrect 2FA / Lock")
      var loopFlag = true
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click()
      
      //await for 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);      
      //set 2FA INPUT
      let inputTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)

      let countLoop = 0

      while(loopFlag){        
        try{
          await new Promise(resolve => setTimeout(resolve, 2000));
          await inputTwofaCode.sendKeys("333333")
          await waitForElementUntilDisappearByXPath("//UIAActivityIndicator[@name='In progress']", driver);
          loopFlag = true                    
        }catch{          
          await waitForElementUntilAppear("Okay",driver)
          let textFromAlert =  await driver.alertText()                
          await driver.dismissAlert()
          loopFlag = !(structure.loginActivity.userBlockedMessage.includes(textFromAlert))
        }
        countLoop++
      }

      let close2fa = await driver.elementById(structure.twoFaActivity.twofaViewControllerBackBtn)
      await close2fa.click()

      await new Promise(resolve => setTimeout(resolve, 1500));

      await emailField.clear()
      await passwordField.clear()

      await new Promise(resolve => setTimeout(resolve, 2000));

      await emailField.sendKeys(userTest[0].email);
      await passwordField.sendKeys(userTest[0].password);
      
      await logInBtnGo.click();  

      await waitForElementUntilAppear("Okay",driver)

      let textAlert = await driver.alertText()

      await driver.dismissAlert()

      let backBtn = await driver.elementById(structure.loginActivity.loginViewControllerBackBtn)
      await backBtn.click()
      
      expect(`${countLoop}th attempt should receive pop up`).toBe(structure.loginActivity.attempsCountTwofa)      
      expect(textAlert).toContain(structure.loginActivity.userBlockedMessage)    

    });
    //10
    test("[Failure] Log In — Incorrect Password + 2FA / Lock", async () => {
      console.log("10. [Failure] Log In — Incorrect Password + 2FA / Lock")
      var loopFlag = true
      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys("Abc1234.");

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      
      var countLoginAttempts = 1
      var textFromAlert = ""
      var textFromAlertLogin = ""

      //3 attempts to login
      while(countLoginAttempts <= 2){
        await logInBtnGo.click();
        await waitForElementUntilAppear("Okay",driver)
        textFromAlertLogin =  await driver.alertText()      
        await driver.dismissAlert()        
        countLoginAttempts++
      }
      countLoginAttempts-- 
      
      //clear fields
      await new Promise(resolve => setTimeout(resolve, 1500));
      await emailField.clear()
      await passwordField.clear()

      //set info
      await emailField.sendKeys(userTest[0].email);
      await passwordField.sendKeys(userTest[0].password);

      //Login button
      await logInBtnGo.click();

      //await for 2fa screen
      await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);      
      //set 2FA INPUT
      let inputTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)

      var countTwoFaAttempts = 0

      while(loopFlag){        
        try{
          await new Promise(resolve => setTimeout(resolve, 2000));
          await inputTwofaCode.sendKeys("333333")
          await waitForElementUntilDisappearByXPath("//UIAActivityIndicator[@name='In progress']", driver);
          loopFlag = true                    
        }catch{          
          await waitForElementUntilAppear("Okay",driver)
          textFromAlert =  await driver.alertText()                
          await driver.dismissAlert()
          loopFlag = !(structure.loginActivity.userBlockedMessage.includes(textFromAlert))
        }
        countTwoFaAttempts++
      }

      let close2fa = await driver.elementById(structure.twoFaActivity.twofaViewControllerBackBtn)
      await close2fa.click()

      await new Promise(resolve => setTimeout(resolve, 1500));

      await emailField.clear()
      await passwordField.clear()

      await new Promise(resolve => setTimeout(resolve, 2000));

      await emailField.sendKeys(userTest[0].email);
      await passwordField.sendKeys(userTest[0].password);
      
      await logInBtnGo.click();  

      await waitForElementUntilAppear("Okay",driver)

      let textAlert = await driver.alertText()

      await driver.dismissAlert()

      let backBtn = await driver.elementById(structure.loginActivity.loginViewControllerBackBtn)
      await backBtn.click()

      expect(textFromAlertLogin).toContain(structure.loginActivity.incorrectUserNameOrPasswordMessage)
      expect(`${countLoginAttempts} attempts login`).toBe("2 attempts login")
      expect(`${countTwoFaAttempts}th attempt should receive pop up`).toBe("4th attempt should receive pop up")
      expect(textAlert).toContain(structure.loginActivity.userBlockedMessage) 
      
    });
    //11
    test("[Failure] Log In — Not Fraud / Unathorized", async () => {
      console.log("11. [Failure] Log In — Not Fraud / Unathorized")   
      await api.post(structure.settingsProject.urlBlockAccount,{"email": userTest[0].email,"type": "BLOCK"})

      /*Wait for lauch app*/
      await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
              
      let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
      await logInBtn.click();

      let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
      await emailField.sendKeys(userTest[0].email);

      let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
      await passwordField.sendKeys(userTest[0].password);

      let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
      await logInBtnGo.click();

      //await for UIAlert
      await waitForElementUntilAppear("Okay",driver)      
      let textFromAlert =  await driver.alertText()      
      await driver.dismissAlert()

      let backBtn = await driver.elementById(structure.loginActivity.loginViewControllerBackBtn)
      await backBtn.click()
      textFromAlert
      expect(textFromAlert).toContain(structure.loginActivity.userBlockedMessage)      
    });
});

describe("Login SIFT" ,() => {

  beforeAll(async () => {    
    await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})                
  })

  afterEach(async () => {    
    await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})
  })

  afterAll(async () => {        
    await api.post(structure.settingsProject.siftSettingsUlr,{"events":["$login",], "status": false })
  });

  test("[Failure] Log In — Sift Block", async () => {   
    console.log("12. [Failure] Log In — Sift Block")
    /*TURN ON SIFT SETTINGS*/
    await api.post(structure.settingsProject.siftSettingsUlr,{"events":[structure.settingsProject.siftSettingsEvents[4]], "status": true})

    /*Wait for lauch app*/
    await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);
            
    let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
    await logInBtn.click();

    let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
    await emailField.sendKeys(userTest[0].email);

    let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
    await passwordField.sendKeys(userTest[0].password);

    let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
    await logInBtnGo.click();

    //await for 2fa screen
    await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

    let twofaCodeInput = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)      
    
    //get 2fa real code
    let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})

    await twofaCodeInput.sendKeys(twoFaCode[0].validation_token)

    //await for UIAlert
    await waitForElementUntilAppear(structure.siftActivity.SiftButton,driver)      
    let textFromAlert =  await driver.alertText()       
    await driver.dismissAlert()
    expect(textFromAlert).toContain(structure.siftActivity.SiftMessage)
  
  });

});
