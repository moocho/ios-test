const structure = require("./structure.json");
const api = require("../api/api");

//#region - FLOW FUNCTIONS

module.exports.openSettings = async (driver, asserters) => {  
  let btnProfile = await driver.elementById(
    structure.dashboardActivity.btnProfile
  );
  await btnProfile.click();

  let isLoading = await this.findIosElement(structure.profileActivity.loadingScreen, driver);

  if (isLoading) {    
    await this.waitForElementUntilDisappear(structure.profileActivity.loadingScreen, driver);
  }  
};

module.exports.addCard = async (driver, asserters, ccInfo,siftTest) => {
  try{
  /*SCREEN ELEMENTS*/
  let paymentView = await this.findIosElement(structure.profileActivity.paymentCardScreen,driver);

  if (paymentView) {
    let addAcard = await driver.elementById(
      structure.paymentCardActivity.addCardButton
    );
    await addAcard.click();
  }
  
  //Card Number
  let cardNumber = await driver.elementById(
    structure.creditCardActivity.inputCardNumber
  );
  await cardNumber.sendKeys(ccInfo.number);
  //Expiration Date
  let expirationDate = await driver.elementById(structure.creditCardActivity.inputExpirationDate);
  await expirationDate.sendKeys(ccInfo.expiration);
  //Input CVC
  let cvcCode = await driver.elementById(ccInfo.type == "AMEX" ? structure.creditCardActivity.inputCVV : structure.creditCardActivity.inputCVC);
  await cvcCode.sendKeys(ccInfo.cvc);
  //ZIP
  let inputZip = await driver.elementByXPath(
    structure.creditCardActivity.inputZIP
  );
  await inputZip.sendKeys(ccInfo.zip);
  //submint button
  let submitBtn = await driver.elementById(
    structure.creditCardActivity.submitBtn
  );
  await submitBtn.click();
  
  await this.waitForElementUntilDisappear(structure.creditCardActivity.loadingSavingScreen, driver); 
  
  let alertElement = await this.findIosElement("Okay", driver);
  
  if (alertElement && !siftTest) {
    let messageReturn = await this.waitForTwoElementUntilAppears(structure.creditCardActivity.duplicateCreditCardMsg,structure.creditCardActivity.invalidCreditCardInfoMsgExpDate,driver)  
    let alertBtn = await driver.elementById("Okay")
    await alertBtn.click()
    return messageReturn
  }else if(siftTest){

    await this.waitForElementUntilAppear("Error",driver)    
    await this.findIosElement(structure.creditCardActivity.siftErrorMsg,driver)

    let alertElementSift = await this.findIosElement("Okay", driver);
    if(alertElementSift){
      let alertBtnOkay = await driver.elementById("Okay")
      await alertBtnOkay.click()      
    }
     if(alertElement){
      let alertBtnOk = await driver.elementById("Okay")
      await alertBtnOk.click()
    }
    
    return structure.creditCardActivity.siftErrorMsg
  }

  let elementDisplayed = await this.waitForTwoElementUntilAppears(structure.paymentCardActivity.paymentCardScreen,structure.profileActivity.accountScreen,driver)

  if(elementDisplayed === structure.paymentCardActivity.paymentCardScreen){
    let last4Digits = `x${ccInfo.number.slice(-4)}`
    await driver.waitForElementById(last4Digits, asserters.isDisplayed,20000,100);
    return "SUCCESS CC LIST"
  }

  return "SUCCESS CC"
}catch(error){
  console.log("ADD CARD ERROR",error)  
}

};

module.exports.editCard = async (driver,asserters, ccInfo,action,expDate,siftTest) => {

  await driver.waitForElementById(structure.paymentCardActivity.paymentCardScreen, asserters.isDisplayed, 60000, 100);
  let last4Digits = `x${ccInfo.number.slice(-4)}`
  await this.waitForElementUntilAppear(last4Digits,driver)
  let cardItem = await driver.elementById(last4Digits)
  cardItem.click()
  
  await driver.waitForElementById(structure.editCreditCardActivity.editCreditCardScreen, asserters.isDisplayed, 60000, 100);

  switch (action) {
    case "DELETE":
      
      let removeCardBtn = await driver.elementById(structure.editCreditCardActivity.removeCardBtn)
      await removeCardBtn.click()

      let removeCardSubmitBtn = await driver.elementById(structure.editCreditCardActivity.removeCardSubmitBtn)
      await removeCardSubmitBtn.click()

      if(siftTest){        
        return this.findSiftErrorMessage(driver)
      }

      await driver.waitForElementById("Okay", asserters.isDisplayed, 60000, 100);

      let messageSuccess = await this.findIosElement(structure.editCreditCardActivity.removeCardSuccessMsg,driver) 

      let okeyBtn = await driver.elementById("Okay")
      await okeyBtn.click()

      await driver.waitForElementById(structure.paymentCardActivity.paymentCardScreen, asserters.isDisplayed, 60000, 100);

      return messageSuccess ?  structure.editCreditCardActivity.removeCardSuccessMsg : "error deleting card"

    case "PRIMARY":
      let existPassPrimaryCard = ""
      let primaryCardBtn = await driver.elementById(structure.editCreditCardActivity.makePrimaryCardBtn)
      await primaryCardBtn.click()

      await driver.waitForElementById(structure.editCreditCardActivity.loadingWaitingScreen, asserters.isDisplayed, 80000, 100)
      await this.waitForElementUntilDisappear(structure.editCreditCardActivity.loadingWaitingScreen, driver)

      if(siftTest){        
        existPassPrimaryCard = await this.findSiftErrorMessage(driver)        
        
        try{                    
          await driver.waitForElementById(structure.editCreditCardActivity.primaryCardTextFlag,asserters.isDisplayed,60000,100)
          existPassPrimaryCard = "This test does not match with the criteria paremeters"
        }catch{
          existPassPrimaryCard = structure.creditCardActivity.siftErrorMsg
        }

        return existPassPrimaryCard

      }else{        
        
        await driver.waitForElementById(structure.editCreditCardActivity.primaryCardTextFlag,asserters.isDisplayed,60000,100)
        return "PRIMARY CARD SUCCESS"

      }
    case "EXPDATE":
      let existExpDateCard = ""
      
      let updateCardBtn = await driver.elementById(structure.editCreditCardActivity.updateExpDateCardBtn)
      await updateCardBtn.click()
      //edit card screen
      await driver.waitForElementById(structure.expirationDateCardActivity.editExpDateScreen, asserters.isDisplayed, 80000, 100)
      //set Date
      let setDate = await driver.elementById(structure.expirationDateCardActivity.inputDate)
      await setDate.sendKeys(expDate)
      //submit button
      let submitBtn = await driver.elementById(structure.expirationDateCardActivity.submitBtn)
      await submitBtn.click()


      if(siftTest){        
        
        existExpDateCard = await this.findSiftErrorMessage(driver)        

        try{
          let cancelButton = await driver.elementById(structure.expirationDateCardActivity.canceltBtn)
          cancelButton.click()
          
          await driver.waitForElementById(structure.expirationDateCardActivity.editCreditCardScreen, asserters.isDisplayed, 80000, 100)

          let expDateElement = await driver.elementById(structure.editCreditCardActivity.expirationDateTextFlag)
          let expDateElementTxt = await expDateElement.text()
          expDateElementTxt = expDateElementTxt.replace('exp ', '')
          expDateElementTxt = (expDateElementTxt.split('/')[0]).length == 1 ? `0${expDateElementTxt.replace('/','')}` : expDateElementTxt.replace('/','')      
          
          console.log("DATE EXP LABEL",expDateElementTxt)

          if(existExpDateCard === expDate){
              existExpDateCard = 'This test does not match with the criteria paremeters'
          }

        }catch{
          existExpDateCard = 'This test does not match with the criteria paremeters'
        }

        return existExpDateCard

      }else{
        await driver.waitForElementById("Okay", asserters.isDisplayed, 60000, 100);
        let messageEditDateSuccess = await this.findIosElement(structure.expirationDateCardActivity.editExpDateSuccessMsg,driver) 
        let okBtn = await driver.elementById("Okay")
        await okBtn.click()
        return messageEditDateSuccess ? structure.expirationDateCardActivity.editExpDateSuccessMsg : "Invalid Expiration Date"
      }

      

    default:
      break;
  }
}

module.exports.login = async (driver, asserters,email,pass) => {

  //await for launch Screen  
  await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);

  let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
  await logInBtn.click();

  let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
  await emailField.sendKeys(email);

  let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
  await passwordField.sendKeys(pass);

  let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
  await logInBtnGo.click();

  //await for 2fa screen
  await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);
    
  //get 2fa code
  let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": email})
  
  if(twoFaCode.count === 0){
    throw new Error("NO 2fa code");
  }

  //set 2fa code
  let setTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)
  await setTwofaCode.sendKeys(twoFaCode[0].validation_token)

  //if 2fa code is correct 2fa screen disappears  
  await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

  let elementDisplayed = await this.waitForTwoElementUntilAppears(structure.dashboardActivity.dashboard,structure.creditCardActivity.creditCardScreen,driver)
  
  if(elementDisplayed === structure.creditCardActivity.creditCardScreen){
      let skipCreditCardScreen = await driver.elementById(structure.creditCardActivity.skipBtn)
      await skipCreditCardScreen.click()
  }  
  //await for dashboard  
  await driver.waitForElementById(structure.dashboardActivity.dashboard, asserters.isDisplayed, 60000, 100);
  
  //await driver.waitForElementById(structure.dashboardActivity.loadingScreen, asserters.isDisplayed, 60000, 100);  
  
  await this.waitForElementUntilDisappear(structure.dashboardActivity.loadingScreen, driver);  
  
};

module.exports.backToDashboard = async (driver,asserters,wd) => {  
  let alertElement = await this.findIosElement("Okay", driver);
  if(alertElement){
    let okBtn = await driver.elementById("Okay")
    await okBtn.click()    
  } 
  let keepAsking = true
  while(keepAsking){
    await (new wd.TouchAction(driver))
    .press({x: 0, y: 100})
    .wait(100)
    .moveTo({x: 0, y: 700})
    .release()
    .perform()    
    keepAsking = !(await this.findIosElementDisplayed(structure.dashboardActivity.dashboard, driver, asserters))        
  }

  let homeBtn = await driver.elementById(structure.dashboardActivity.btnHome)
  await homeBtn.click()  
  await this.waitForElementUntilDisappear(structure.dashboardActivity.loadingScreen, driver);    
}

module.exports.backToDashboardNoRefreshData = async (driver,asserters,wd) => {  
  let alertElement = await this.findIosElement("Ok", driver);
  if(alertElement){
    let okBtn = await driver.elementById("Ok")
    await okBtn.click()    
  } 
  let keepAsking = true
  while(keepAsking){
    await (new wd.TouchAction(driver))
    .press({x: 0, y: 100})
    .wait(100)
    .moveTo({x: 0, y: 700})
    .release()
    .perform()    
    keepAsking = !(await this.findIosElementDisplayed(structure.dashboardActivity.dashboard, driver, asserters))        
  }
}

//login test

module.exports.loginSetCredentials = async (driver, asserters,email,pass) => {

  //await for launch Screen  
  await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);

  let logInBtn = await driver.elementById(structure.launchActivity.launchViewControllerLogInBtn);
  await logInBtn.click();

  let emailField = await driver.elementById(structure.loginActivity.loginViewControllerEmailInput);
  await emailField.sendKeys(email);

  let passwordField = await driver.elementById(structure.loginActivity.loginViewControllerPasswordInput);
  await passwordField.sendKeys(pass);

  let logInBtnGo = await driver.elementById(structure.loginActivity.loginViewControllerLogInBtn);
  await logInBtnGo.click();

  //await for 2fa screen
  await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isDisplayed, 60000, 100);
    
  //get 2fa code
  let twoFaCode = await api.post(structure.settingsProject.urlGetLoginToken,{"email": email})
  
  if(twoFaCode.count === 0){
    throw new Error("NO 2fa code");
  }

  //set 2fa code
  let setTwofaCode = await driver.elementById(structure.twoFaActivity.twofaViewControllerInput1)
  await setTwofaCode.sendKeys(twoFaCode[0].validation_token)

  //if 2fa code is correct 2fa screen disappears  
  await driver.waitForElementById(structure.twoFaActivity.twofaAuthScreen, asserters.isNotDisplayed, 60000, 100);

};


//#endregion

//#region - ELEMENTS FUNCTIONS
module.exports.findIosElement = async (element, driver) => {
  return driver.elementById(element).then(
    function (webElement) {
      return true;
    },
    function (err) {
      return false;
    }
  );
};

//waitForElementUntilDisappearByXPath

module.exports.findIosElementByXPath = async (element, driver) => {
  return driver.elementByXPath(element).then(
    function (webElement) {
      return true;
    },
    function (err) {
      return false;
    }
  );
};

module.exports.findIosElementDisplayed = async (element, driver,asserters) => {  
  return driver.waitForElementById(element,asserters.isDisplayed,50,25
  ).then(
    function (webElement) {      
      return true;
    },
    function (err) {      
      return false;
    }
  );
};

module.exports.waitForElementUntilDisappear = async (element, driver) => {
  var startTime = Date.now();
  let itemFound = true;
  while (itemFound && Date.now() - startTime < 15000) {      
    itemFound = await this.findIosElement(element, driver);    
  }
  if (itemFound) {
    throw new Error(`TimeOut on element dissapears\n  element: ${element}`);
  }
};

module.exports.waitForElementUntilDisappearByXPath = async (element, driver) => {
  var startTime = Date.now();
  let itemFound = true;
  while (itemFound && Date.now() - startTime < 6500) {      
    itemFound = await this.findIosElementByXPath(element, driver);    
  }
  if (itemFound) {
    throw new Error(`TimeOut on element dissapears\n  element: ${element}`);
  }
};

module.exports.waitForElementUntilAppear = async (element, driver) => {
  var startTime = Date.now();
  let itemFound = true;
  while (itemFound && Date.now() - startTime < 15000) {      
    itemFound = !(await this.findIosElement(element, driver));    
  }
  if (itemFound) {
    throw new Error(`TimeOut on element appear element: ${element}`);
  }
};

module.exports.waitForTwoElementUntilAppears = async (element1,element2, driver) => {
    let itemFound = true;
    let item1 = false
    let item2 = false
    
    while (itemFound) {              
        item1 = await this.findIosElement(element1, driver);
        item2 = await this.findIosElement(element2, driver);
        itemFound = !(item1 || item2)            
    }
    
    if(item1){
        return element1
    }

    return item2 ? element2 : ""

  };
  

module.exports.findSiftErrorMessage = async (driver) => {  
      
  await this.waitForElementUntilAppear("Error",driver)    
      await this.findIosElement(structure.creditCardActivity.siftErrorMsg,driver)  
      let alertElementSift = await this.findIosElement("Okay", driver);
      let alertElement = await this.findIosElement("Ok", driver);
      if(alertElementSift){
        let alertBtnOkay = await driver.elementById("Okay")
        await alertBtnOkay.click()      
      }
       if(alertElement){
        let alertBtnOk = await driver.elementById("Ok")
        await alertBtnOk.click()
      }      
      return structure.creditCardActivity.siftErrorMsg    
  }
//#endregion
