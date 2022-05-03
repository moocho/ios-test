const wd = require("wd");
const driver = wd.promiseChainRemote("http://127.0.0.1:4723/wd/hub/");
const asserters = wd.asserters;
const structure = require("../commons/structure.json");
const {openSettings,addCard,login,backToDashboard,findIosElement,editCard,backToDashboardNoRefreshData,waitForTwoElementUntilAppears,waitForElementUntilAppear} = require("../commons/commonsFunctions");
const api = require("../api/api");


const cardsItemTest = [{type:"VISA",number:'4242424242424242', expiration:'01/32', cvc:'001', zip:'01010',lasFourDigits:"x4242"},
                       {type:"MASTER",number:'5555555555554444', expiration:'02/32', cvc:'002', zip:'01010',lasFourDigits:"x4444"},
                       {type:"AMEX",number:'378282246310005', expiration:'03/32', cvc:'0034', zip:'01010',lasFourDigits:"x0005"},
                       {type:"DISCOVERY",number:'6011111111111117', expiration:'04/32', cvc:'004', zip:'01010',lasFourDigits:"x1117"},
                       {type:"VISA",number:'4242424242424242', expiration:'01/21', cvc:'001', zip:'01010',lasFourDigits:"x4242"}]

const userTest = [{email:'ledr1993+delivery01@gmail.com', password:'Abc123.'},
                  {email:'ledr1993+gc8@gmail.com', password:'Abc123.'}]


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


jest.setTimeout(90 * 1000)

beforeAll(async () => {   
    await driver.init(caps)
})

afterAll(async () => {  
  await driver.quit() 
});


describe('Credit Card Management Tests', () => {
  
  afterEach(async () => {    
    await backToDashboard(driver,asserters,wd)     
  })

  test('[Success] Add Card Visa', async () => {
    let askForDashboard = await findIosElement(structure.dashboardActivity.dashboard,driver)    
    
    if(!askForDashboard){      
      /*CLEAR ALL USER CARDS*/
      await api.post(structure.settingsProject.urlDeleteAllUserCards,{"email": userTest[0].email})      
      /*CLEAR STRIPE TEST CARDS*/
      await api.get(structure.settingsProject.urlClearTestCards)      
      await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);
      /*login PROCCESS*/
      await login(driver,asserters,userTest[0].email,userTest[0].password)
    }

    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[0]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.creditCardSuccess)
   
  });

  test('[Success] Add Card Mastercard', async () => {
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[1]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.creditCardSuccess)
   
  });

  test('[Success] Add Card Amex', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[2]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.creditCardSuccess)
   
  });

  test('[Success] Add Card Discover', async () => {
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[3]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.creditCardSuccess)
   
  });

  test('[Success] Delete Non-Primary Card - VISA', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();

    let editCardProccess = await editCard(driver, asserters, cardsItemTest[0],"DELETE")    
    expect(editCardProccess).toContain(structure.editCreditCardActivity.removeCardSuccessMsg)

  });

  test('[Success] Delete Primary Card - DISCOVERY', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();

    let editCardProccess = await editCard(driver, asserters, cardsItemTest[3],"DELETE")    
    expect(editCardProccess).toContain(structure.editCreditCardActivity.removeCardSuccessMsg)

  });

  test('[Success] Add Back Deleted Card (To Same Account) - VISA', async () => {
    let askForDashboard = await findIosElement(structure.dashboardActivity.dashboard,driver)    
    if(!askForDashboard){      
      /*CLEAR ALL USER CARDS*/
      await api.post(structure.settingsProject.urlDeleteAllUserCards,{"email": userTest[0].email})      
      /*CLEAR STRIPE TEST CARDS*/
      await api.get(structure.settingsProject.urlClearTestCards)      
      await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);
      /*LOADING PROCCESS*/
      await login(driver,asserters,userTest[0].email,userTest[0].password)
    }

    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[0]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.creditCardSuccess)
   
  });

  test('[Failure] Add Expired Card - VISA', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[4]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.invalidCreditCardInfoMsgExpDate)   
  });

  test('[Success] Change Primary Card - Mastercard', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let editCardProccess = await editCard(driver, asserters, cardsItemTest[1],"PRIMARY")    
    expect(editCardProccess).toContain("PRIMARY CARD SUCCESS")

  });

  test('[Success] Change Exp. Non-Primary Card - AMEX', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let editCardProccess = await editCard(driver, asserters, cardsItemTest[2],"EXPDATE","0325")
    expect(editCardProccess).toContain(structure.expirationDateCardActivity.editExpDateSuccessMsg)

  });

  test('[Failure] Change Exp. Non-Primary Card (Expired) - AMEX', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let editCardProccess = await editCard(driver, asserters, cardsItemTest[2],"EXPDATE","0320")    
    expect(editCardProccess).toContain("Invalid Expiration Date")

  });

  test('[Success] Change Exp. Primary Card - Mastercard', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let editCardProccess = await editCard(driver, asserters, cardsItemTest[1],"EXPDATE","0325")    
    expect(editCardProccess).toContain(structure.expirationDateCardActivity.editExpDateSuccessMsg)

  });

  test('[Failure] Change Exp. Primary Card (Expired) - Mastercard', async () => {    
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let editCardProccess = await editCard(driver, asserters, cardsItemTest[1],"EXPDATE","0320")    
    expect(editCardProccess).toContain("Invalid Expiration Date")
  });

  test('[Failure] Add Card (Already On This Account) - Mastercard', async () => {  
    /*CLEAR STRIPE TEST CARDS*/
    await api.get(structure.settingsProject.urlClearTestCards)      
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    let addCardProccess = await addCard(driver, asserters, cardsItemTest[1]);    
    expect(addCardProccess).toContain(structure.creditCardActivity.duplicateCreditCardMsg)
   
  });

});
  
describe('SIFT TESTS', () => {

    afterEach(async () => {    
    await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})            
    await backToDashboard(driver,asserters,wd)     
    })

  afterAll(async () => {    
    await api.post(structure.settingsProject.siftSettingsUlr,{"events":["payment_method_updated","payment_method_deleted","payment_method_added"], "status": false })
  });

  test('[Failure] Add Card (Sift Block) - VISA ', async () => {    
    let validationMessage = "Card is not on the list"
   
    /*TURN ON SIFT SETTINGS*/
    await api.post(structure.settingsProject.siftSettingsUlr,{"events":[structure.settingsProject.siftSettingsEvents[12]], "status": true})
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();
    
    let addcardProcess = await addCard(driver, asserters, cardsItemTest[0],true);  

    if(addcardProcess === structure.creditCardActivity.siftErrorMsg){

      await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})            
      await backToDashboard(driver,asserters,wd)

      /*OPENING SETTINGS*/
      await openSettings(driver, asserters);
      btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
      /*OPEN CREDIT CARD VIEW*/      
      await btnOpenCC.click();

      let elementDisplayed = await waitForTwoElementUntilAppears(structure.paymentCardActivity.paymentCardScreen,structure.profileActivity.accountScreen,driver)
      
      if(elementDisplayed === structure.paymentCardActivity.paymentCardScreen){            
        let cardItem = await findIosElement(cardsItemTest[0].lasFourDigits,driver)      
        validationMessage =  cardItem ? "Card was added to payment list" : "Card is not on the list"             
      }

    }else{
      validationMessage = "Test failed"
    }
    
    expect(validationMessage).toContain("Card is not on the list")    
  });

  test('[Failure] Change Primary Card (Sift Block) - AMEX', async () => {    
      /*TURN ON SIFT SETTINGS*/
    await api.post(structure.settingsProject.siftSettingsUlr,{"events":[structure.settingsProject.siftSettingsEvents[10]], "status": true})
    /*OPENING SETTINGS*/
    await openSettings(driver, asserters);
    /*OPEN CREDIT CARD VIEW*/
    let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
    await btnOpenCC.click();  
    let editCardProccess = await editCard(driver, asserters, cardsItemTest[2],"PRIMARY",'',true)    

    expect(editCardProccess).toContain(structure.creditCardActivity.siftErrorMsg)
  });

  test('[Failure] Change Exp. (Sift Block) - Mastercard', async () => {
    /*TURN ON SIFT SETTINGS*/
  await api.post(structure.settingsProject.siftSettingsUlr,{"events":[structure.settingsProject.siftSettingsEvents[10]], "status": true})
  /*OPENING SETTINGS*/
  await openSettings(driver, asserters);
  /*OPEN CREDIT CARD VIEW*/
  let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
  await btnOpenCC.click();  
  let editCardProccess = await editCard(driver, asserters, cardsItemTest[1],"EXPDATE",'0126',true)  
  expect(editCardProccess).toContain(structure.creditCardActivity.siftErrorMsg)

  });

  test('[Failure] Delete Card (Sift Block) - AMEX', async () => {    
    /*TURN ON SIFT SETTINGS*/
  await api.post(structure.settingsProject.siftSettingsUlr,{"events":[structure.settingsProject.siftSettingsEvents[11]], "status": true})
  /*OPENING SETTINGS*/
  await openSettings(driver, asserters);
  /*OPEN CREDIT CARD VIEW*/
  let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
  await btnOpenCC.click();  
  let editCardProccess = await editCard(driver, asserters, cardsItemTest[2],"DELETE",'',true)
  expect(editCardProccess).toContain(structure.creditCardActivity.siftErrorMsg)

  });

});

describe('Tests CC Different account', () => {
  
  beforeAll(async () => {   
    /*CLEAR ALL USER CARDS*/
  await api.post(structure.settingsProject.urlDeleteAllUserCards,{"email": userTest[1].email})        
  })
  
  afterEach(async () => {    
      await backToDashboard(driver,asserters,wd)     
    })

    test('[Failure] Add Card (Deleted / Not Cleared From Other Account) - MasterCard', async () => {    
      /*OPENING SETTINGS*/
      await openSettings(driver, asserters);
            
      /*LOGOUT ACCOUNT*/
      let btnLogOut = await driver.elementById(structure.profileActivity.logOutBtn);
      await btnLogOut.click();

      await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);
      
      /*LOADING PROCCESS*/
      await login(driver,asserters,userTest[1].email,userTest[1].password)
      
      /*OPENING SETTINGS*/
      await openSettings(driver, asserters);

      /*OPEN CREDIT CARD VIEW*/
      let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
      await btnOpenCC.click();

      let addCardProccess = await addCard(driver, asserters, cardsItemTest[1]);      
      expect(addCardProccess).toContain(structure.creditCardActivity.duplicateCreditCardMsg)


    });


    test('[Failure] Add Card (Not Deleted / Not Cleared From Other Account) - VISA', async () => {          
      /*OPENING SETTINGS*/
      await openSettings(driver, asserters);
      /*OPEN CREDIT CARD VIEW*/
      let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
      await btnOpenCC.click();
      let addCardProccess = await addCard(driver, asserters, cardsItemTest[0]);      
      expect(addCardProccess).toContain(structure.creditCardActivity.duplicateCreditCardMsg)

    });

    test('[Success] Add Card (Not Deleted / Cleared From Other Account) - VISA', async () => {    
            
      /*CLEAR STRIPE TEST CARDS*/
      await api.get(structure.settingsProject.urlClearTestCards)      
      
      /*OPENING SETTINGS*/
      await openSettings(driver, asserters);

      /*OPEN CREDIT CARD VIEW*/
      let btnOpenCC = await driver.elementById(structure.profileActivity.openPaymentsBtn);
      await btnOpenCC.click();

      /*ADD CARD*/
      let addCardProccess = await addCard(driver, asserters, cardsItemTest[1]);      
      expect(addCardProccess).toContain(structure.creditCardActivity.creditCardSuccess)

    });


  });
