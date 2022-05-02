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
  loginSetCredentials
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
  
        await driver.waitForElementById(structure.dashboardActivity.loadingScreen, asserters.isDisplayed, 60000, 100);  
  
        await waitForElementUntilDisappear(structure.dashboardActivity.loadingScreen, driver);  

        /*OPENING SETTINGS*/
        await openSettings(driver, asserters);
            
        /*LOGOUT ACCOUNT*/
        let btnLogOut = await driver.elementById(structure.profileActivity.logOutBtn);
        await btnLogOut.click();
        await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);

      })

  test("[Success] Log In — SMS autofill", async () => {
    /*Wait for lauch app*/
    await driver.waitForElementById(structure.launchActivity.launchScreen,asserters.isDisplayed,60000,100);

    /*login set data and go*/
    await loginSetCredentials(driver, asserters, userTest[0].email, userTest[0].password);

  });

  test("[Success] Log In — SMS manual fill", async () => {
    
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

  test("[Success] Log In — Resend Code to SMS", async () => {
    
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

  test("[Success] Log In — Resend Code to Email", async () => {
    
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

    //set old code
    await inputTwofaCode.sendKeys(twoFaCodeOldCode[0].validation_token)

    //await for again 2fa screen
    await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);

    // //get 2fa real code from EMAIL
    let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": userTest[0].email})
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    await inputTwofaCode.sendKeys(twoFaCode[0].validation_token)

    //if 2fa code is correct 2fa screen disappears  
    await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

  });

  test("[Success] Log In — Background App", async () => {
    
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

});
