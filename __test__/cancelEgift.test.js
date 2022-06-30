const wd = require("wd");
const driver = wd.promiseChainRemote("http://127.0.0.1:4723/wd/hub/");
const asserters = wd.asserters;
const structure = require("../commons/structure.json");
const {  
 findIosElement, 
 waitForElementUntilDisappear,
login
} = require("../commons/commonsFunctions");
const api = require("../api/api");

/**
Account A, which has:
 * Stripe test card on file
 * Deal available at Merchant 1
 * $>0 of all the following: Anywhere Credit, Merchant Credit at Merchant with Deal, Moocho Cash, Bonus Cash
 * Reward available but not claimed at Merchant 1
 * Enough Mooches to claim Reward at Merchant 1
Account B, which has:
 * Stripe test card on file
 * No credits
Account C, which has:
 * Dummy card on file
 * No credits 
**/

const userTest = [
    { email: "ledr1993+delivery02@gmail.com", password: "Abc1234" },
    { email: "ledr1993+delivery03@gmail.com", password: "Abc1234" },
    { email: "ledr1993+delivery04@gmail.com", password: "Abc1234" },
  ];

/**
Merchant 1, which has:
 * Deal that automatically deducts (one-time use)
 * Reward that automatically deducts
 * Associated with functional eGift product
Merchant 2, which:
 * Is associated with a timeout eGift product (I believe DIGITAL FRC 08: 504 GATEWAY TIMEOUT product correctly causes Activate eGift Error, but you need to confirm)
 * Has a Deal that automatically deducts (one-time use)
Merchant 3, which has:
 * No Deal
 * No Reward
 * Associated with functional eGift product 
**/

const merchantTest = [{name:"Winn-Dixie (5850 SW 73rd St)"},{name:"Lime"}]

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
    /*CLEAR USER STATUS*/
    await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})    
    //ASK FOR DASHBOARD
    let askForDashboard = await findIosElement(structure.dashboardActivity.dashboard,driver)        
    if(!askForDashboard){              
    await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);
    /*login PROCCESS*/
    await login(driver,asserters,userTest[0].email,userTest[0].password)
    console.log("ON DASHBOARD")
    }
});

afterAll(async () => {
    await driver.quit();
  });
  
  describe("1. [Account A] Cancel Screen → Cancel (with Deal)", () => {
    console.log('1. [Account A] Cancel Screen → Cancel (with Deal)')

    test("Cancel screen opens", async () => {        
        console.log("Cancel screen opens")
        let merchantItem = await driver.elementById(merchantTest[0].name)
        await merchantItem.click()
        //await for egift view
        await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 60000, 100);        
        //set value
        let number4 = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberFour)
        await number4.click()    
        let numberDoubleZero = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberDoubleZero)
        await numberDoubleZero.click()
        await numberDoubleZero.click()
        //pay button
        let payButton =  await driver.elementById(structure.giftCardActivity.giftCardViewPayButton)
        await new Promise(resolve => setTimeout(resolve, 3000));
        await payButton.click()        
        //cancel view
        let cancelView = await driver.waitForElementById(structure.giftCardActivity.giftCardCardViewCancelScreen.giftCardViewCancelScreen, asserters.isDisplayed, 20000, 100)
        expect(cancelView).not.toBe(null)
    })

    test("text above total now says 'Checkout Amount' and does not include 'Enter'", async () => {        
        console.log("text above total now says 'Checkout Amount' and does not include 'Enter'")        
        let calculatorTitle = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorTitle)
        let calculatorTitleTxt = await calculatorTitle.text()
        expect(calculatorTitleTxt).toBe("Checkout Amount")
    })

    test("correct total that was entered persists and displays", async () => {        
        console.log("correct total that was entered persists and displays")                
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()        
        expect(amountCalculatorTxt).toBe("$400.00")
    })

    test("'You'll pay...' with correct amount to charge card and (i) icon persists", async () => {        
        console.log("'You'll pay...' with correct amount to charge card and (i) icon persists")
        let youwillPayLabel = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayLabel)
        let youWillPayButton = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayButton)        
        expect(youwillPayLabel).not.toBe(null)
        expect(youWillPayButton).not.toBe(null)        
    })

    test("Status text says 'Getting ready to charge you...'", async () => {        
        console.log("Status text says 'Getting ready to charge you...'")
        let labelStatus = await driver.elementById(structure.giftCardActivity.giftCardCardViewCancelScreen.giftCardViewCancelScreenTxtStatus)
        let labelStatusTxt = await labelStatus.text()
        expect(labelStatusTxt).toBe("Getting ready to\ncharge you...")                
    })

    test("'pie chart' animation begins loading", async () => {        
        console.log("'pie chart' animation begins loading")
        let animationPie = await driver.elementById(structure.giftCardActivity.giftCardCardViewCancelScreen.giftCardViewCancelScreenAnimation)
        expect(animationPie).not.toBe(null)
    })

    test("Tap (i) pop up appears", async () => {        
        console.log("Tap (i) pop up appears")
        let youWillPayButton = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayButton)
        youWillPayButton.click()        
        let payDetailPopUp = await driver.waitForElementById(structure.giftCardActivity.giftCardViewPayDetailView, asserters.isDisplayed, 20000, 100)
        expect(payDetailPopUp).not.toBe(null)
    })

    test("First line is 'Total bill:'", async () => {
        console.log("First line is 'Total bill:'")
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)        
        expect(totalBill).not.toBe(null)
    })

    //DEALS
    test("Next line is 'Minus Deal discount:'", async () => {
        console.log("Next line is 'Minus Deal discount:'")
        let minusDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDeal)        
        expect(minusDiscount).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {
        console.log("Correct amount is displayed with minus sign in front of it")
        let minusDiscountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDealValue)        
        let minusDiscountAmountTxt = await minusDiscountAmount.text()
        let validateAmount = minusDiscountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })
    test("Correct Headline of Deal discount is displayed in red text underneath Deal discount line", async () => {     
        console.log("Correct Headline of Deal discount is displayed in red text underneath Deal discount line")   
        let minusDiscountName = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDealName)        
        let minusDiscountAmountTxt = await minusDiscountName.text()                
        expect(minusDiscountAmountTxt).not.toBe("Applicable Discount!")
    })

    //ANYWHERE CREDIT
    test("Next line is 'Minus Anywhere Credit:'", async () => {        
        console.log("Next line is 'Minus Anywhere Credit:'")        
        let anyWhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCredit)        
        expect(anyWhereCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {     
        console.log("Correct amount is displayed with minus sign in front of it")   
        let minusDiscountanyWhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCreditValue)        
        let minusDiscountanyWhereCreditTxt = await minusDiscountanyWhereCredit.text()        
        let validateAmount = minusDiscountanyWhereCreditTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //MERCHANT CREDIT
    test("Next line is 'Minus [merchant name] Credit:'", async () => {    
        console.log("Next line is 'Minus [merchant name] Credit:'")            
        let merchantCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchant)        
        expect(merchantCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {     
        console.log("Correct amount is displayed with minus sign in front of it")   
        let minusDiscountMerchantCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchantValue)        
        let minusDiscountMerchantCreditTxt = await minusDiscountMerchantCredit.text()              
        let validateAmount = minusDiscountMerchantCreditTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //MOOCHOCASH CREDIT
    test("Next line is 'Minus Moocho Cash:'", async () => {        
        console.log("Next line is 'Minus Moocho Cash:'")        
        let moochoCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCash)        
        expect(moochoCashCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {  
        console.log("Correct amount is displayed with minus sign in front of it")      
        let discountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCashValue)        
        let discountAmountTxt = await discountAmount.text()            
        let validateAmount = discountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //BONUSCASH CREDIT
    test("Next line is 'Minus Bonus Cash:'", async () => {      
        console.log("Next line is 'Minus Bonus Cash:'")  
        //thisGonaFail
        let bonusCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonus)        
        expect(bonusCashCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {
        console.log("Correct amount is displayed with minus sign in front of it")        
        let discountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonusValue)        
        let discountAmountTxt = await discountAmount.text()                   
        let validateAmount = discountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //CARD ON FILE
    test("Next line is 'Card on file:'", async () => {          
        console.log("Next line is 'Card on file:'")      
        let cardOnFile = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCardOnFileLabel)        
        expect(cardOnFile).not.toBe(null)
    })

    test("pop up disappears", async () => {
        console.log("pop up disappears")
        let closePayDetail = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCloseButton)
        await closePayDetail.click()        
        let discountBody = await findIosElement(structure.giftCardActivity.giftCardViewPayDetailView,driver)        
        expect(discountBody).toBe(false)   
    })

    test("returns to Enter Total screen", async () => {
        console.log("returns to Enter Total screen")
        let cancelButton = await driver.elementById(structure.giftCardActivity.giftCardCardViewCancelScreen.giftCardViewCancelScreenCancelBtn)
        await cancelButton.click()        
    })

    test("text above total now says 'Enter Checkout Amount' (including 'Enter')", async () => {
        console.log("text above total now says 'Enter Checkout Amount' (including 'Enter')")
        let calculatorTitle = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorTitle)
        let calculatorTitleTxt = await calculatorTitle.text()
        expect(calculatorTitleTxt).toBe("Enter Checkout Amount")
    })

    test("correct total that was entered persists and displays", async () => {
        console.log("correct total that was entered persists and displays")
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()        
        expect(amountCalculatorTxt).toBe("$400.00")
    })


    test("'You'll pay...' with correct amount to charge card and (i) icon persists", async () => {
        console.log("'You'll pay...' with correct amount to charge card and (i) icon persists")
        let youwillPayLabel = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayLabel)
        let youWillPayButton = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayButton)        
        expect(youwillPayLabel).not.toBe(null)
        expect(youWillPayButton).not.toBe(null)        
    })

    
  });

  describe("2. [Account A] Cancel Screen → Processing Screen (success, with Deal)", () => {

  });