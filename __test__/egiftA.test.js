const wd = require("wd");
const driver = wd.promiseChainRemote("http://127.0.0.1:4723/wd/hub/");
const asserters = wd.asserters;
const structure = require("../commons/structure.json");
const {  
 findIosElement,
  openSettings,  
  waitForTwoElementUntilAppears,
  waitForElementUntilAppear,
  waitForElementUntilDisappear,
  loginSetCredentials,
  waitForElementUntilDisappearByXPath,login
} = require("../commons/commonsFunctions");
const api = require("../api/api");

/*
Account A
    - Stripe test card on file
    - Deal available at Merchant 1
    - $>0 of all the following: Anywhere Credit**, Merchant Credit at Merchant with Deal, Moocho Cash, Bonus Cash
    - Reward available but not claimed at Merchant 1
    - 0 Mooches to start
Account B
    - Stripe test card on file
    - No credits
*/

const userTest = [
  { email: "ledr1993+delivery02@gmail.com", password: "Abc123." },
  { email: "ledr1993+delivery03@gmail.com", password: "Abc123." },
];

const merchantTest = [{name:"Winn-Dixie (5850 SW 73rd St)"}]

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
    /*CLERA MOOCHES*/
    await api.post(structure.settingsProject.urlUpdateUserMooches,{"email": userTest[0].email,"value": 0})
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


describe("1. [Account A] Screen Display", () => {        
    console.log('1. [Account A] Screen Display')

    test("top row of page displays merchant name with 'X' on right side", async () => {
        console.log("top row of page displays merchant name with 'X' on right side")
        let merchantItem = await driver.elementById(merchantTest[0].name)
        await merchantItem.click()
        //await for egift view
        await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 60000, 100);
        let merchantTitle = await driver.elementById(structure.giftCardActivity.giftCardViewMerchantName)
        let merchantTitleTxt = await merchantTitle.text()          
        expect(merchantTitleTxt.trim()).toBe('Winn-Dixie (5850 SW 73rd St)')                
    })

    test("hero image and merchant logo appear", async () => {
        console.log("hero image and merchant logo appear")
        let heroImage = await driver.elementById(structure.giftCardActivity.giftCardViewMerchantHeroImage)
        let logoImage = await driver.elementById(structure.giftCardActivity.giftCardViewMerchantLogo)
        expect(heroImage).not.toBe(null)
        expect(logoImage).not.toBe(null)           
    })
    
    test("text above number says 'Enter Check Out Amount'", async () => {
        console.log("text above number says 'Enter Check Out Amount'")
        let calculatorTitle = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorTitle)
        let calculatorTitleTxt = await calculatorTitle.text()
        expect(calculatorTitleTxt).toBe("Enter Check Out Amount")           
    })

    test("collapsed discount dropdown with 'You have discounts that can apply!' and down arrow is showing", async () => {
        console.log("collapsed discount dropdown with 'You have discounts that can apply!' and down arrow is showing")
        let discountTitle = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarTitle)
        let discountTitleArrow = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarTitleArrow)
        let discountTitleTxt = await discountTitle.text()
        let discountTitleArrowTxt = await discountTitleArrow.text()            
        expect(discountTitleTxt).toBe("You have discounts that can apply!")
        expect(discountTitleArrowTxt).toBe("  ▼")
    })

    test("amount shows $0.00", async () => {
        console.log("amount shows $0.00")
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()        
        expect(amountCalculatorTxt).toBe("$0.00")
    })

    test('"Pay Now" button is disabled and Min / Max are displaying below', async () => {
        console.log('"Pay Now" button is disabled and Min / Max are displaying below')
        let btnPay = await driver.waitForElementById(structure.giftCardActivity.giftCardViewPayButton, asserters.isDisplayed, 20000, 100)
        let textMin = await driver.waitForElementById(structure.giftCardActivity.giftCardViewMinLabel, asserters.isDisplayed, 20000, 100)
        let textMax = await driver.waitForElementById(structure.giftCardActivity.giftCardViewMaxLabel, asserters.isDisplayed, 20000, 100)
        expect(textMin).not.toBe(null)
        expect(textMax).not.toBe(null)
        let status = await btnPay.isEnabled()
        expect(status).toBe(false)
        })

});

describe("2. [Account A] How To Pay Pop Up", () => {
    console.log("2. [Account A] How To Pay Pop Up")
    
    test("pop up with 1, 2, and 3 graphics appears", async () => {
        console.log("pop up with 1, 2, and 3 graphics appears")
        let howtoPayBtn = await driver.elementById(structure.giftCardActivity.giftCardViewInfoStepsBtn)
        await howtoPayBtn.click()
        let howtoPayView = await driver.waitForElementById(structure.giftCardActivity.giftCardViewHowToPayView, asserters.isDisplayed, 20000, 100)
        expect(howtoPayView).not.toBe(null)
    })

    test("Transactions page opens", async () => {
        console.log("Transactions page opens")
        await new Promise(resolve => setTimeout(resolve, 1000));        
        let howtoPayView = await driver.waitForElementById(structure.giftCardActivity.giftCardViewHowToPayView, asserters.isDisplayed, 20000, 100)
        expect(howtoPayView).not.toBe(null)
        let transactionBtn = await driver.elementById(structure.giftCardActivity.giftCardViewHowToPayViewTransactionButton)
        await transactionBtn.click()
        let transactionView = await driver.waitForElementById(structure.transactionsActivity.transactionScreen, asserters.isDisplayed, 20000, 100)
        expect(transactionView).not.toBe(null)
    })

    test("returns to Enter Total page and How To Pay Pop Up still appearing", async () => {      
        console.log("returns to Enter Total page and How To Pay Pop Up still appearing")
        let closeTransactionBtn = await driver.elementById(structure.transactionsActivity.transactionHistoryViewCloseButton)
        await closeTransactionBtn.click()        
        let howtoPayView = await driver.waitForElementById(structure.giftCardActivity.giftCardViewHowToPayView, asserters.isDisplayed, 20000, 100)
        expect(howtoPayView).not.toBe(null)
    })

    test("pop up disappears", async () => {        
        console.log("pop up disappears")
        let closeHowToPayBtn = await driver.elementById(structure.giftCardActivity.giftCardViewHowToPayViewCloseButton)
        await closeHowToPayBtn.click()
        let giftCardScreen = await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 20000, 100)
        expect(giftCardScreen).not.toBe(null)
    })

});

describe("3. [Account A] Discount Dropdown — Deal & Reward (Unclaimed)", () => {
    console.log("3. [Account A] Discount Dropdown — Deal & Reward (Unclaimed)")    

    test("discount dropdown expands with text 'Type below to see your discounts in action!' and up arrow", async () => {
        console.log("discount dropdown expands with text 'Type below to see your discounts in action!' and up arrow")
        let openDiscounts = await driver.elementById(structure.giftCardActivity.giftCardViewOpenDiscountsButton)
        await openDiscounts.click()        
        await driver.waitForElementById(structure.giftCardActivity.giftCardViewDiscountBarBody, asserters.isDisplayed, 20000, 100);
        let discountBodyTitle = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarBodyTitle)
        let discountBodyTitleArrow = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarBodyRow)
        let discountBodyTitleTxt = await discountBodyTitle.text()
        let discountBodyTitleArrowTxt = await discountBodyTitleArrow.text()            
        expect(discountBodyTitleTxt).toBe("Type below to see your discounts in action!")
        expect(discountBodyTitleArrowTxt).toBe("▲")
    })

    //DEALS
    test("First discount displaying is Deal", async () => {
        console.log("First discount displaying is Deal")
        let dealDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDeal)        
        expect(dealDiscount).not.toBe(null)        
    })
    test("Deal icon displaying", async () => {    
        console.log("Deal icon displaying")    
        let dealDiscountIcon = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDealIcon)        
        expect(dealDiscountIcon).not.toBe(null)        
    })
    test("Correct Deal header text displaying", async () => {       
        console.log("Correct Deal header text displaying") 
        let dealDiscountLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDealLabel)        
        expect(dealDiscountLabel).not.toBe(null)        
    })
    test("SEE DETAILS button displaying", async () => {       
        console.log("SEE DETAILS button displaying") 
        let dealDiscountButton = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDealButton)        
        expect(dealDiscountButton).not.toBe(null)        
    })

    //REWARDS
    test("Second discount displaying is Reward", async () => {   
        console.log("Second discount displaying is Reward")     
        let rewardDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountReward)        
        expect(rewardDiscount).not.toBe(null)        
    })
    test("Reward icon displaying", async () => {
        console.log("Reward icon displaying") 
        let rewardDiscountIcon = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardIcon)        
        expect(rewardDiscountIcon).not.toBe(null)        
    })
    test("Correct Reward header text displaying", async () => {        
        console.log("Correct Reward header text displaying")
        let rewardDiscountLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardLabel)        
        expect(rewardDiscountLabel).not.toBe(null)        
    })
    test("GET NOW button displaying", async () => {        
        console.log("GET NOW button displaying")
        let rewardDiscountButton = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardButton)        
        expect(rewardDiscountButton).not.toBe(null)        
    })

    //AnyWhereCredit
    test("Third discount displaying is Anywhere Credit", async () => {
        console.log("Third discount displaying is Anywhere Credit")        
        let anywhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountAnywhereCredit)        
        expect(anywhereCredit).not.toBe(null)        
    })
    test("Correct amount of credit is displaying with $ and two decimal places", async () => {
        console.log("Correct amount of credit is displaying with $ and two decimal places")            
        let anywhereCreditLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountAnywhereCreditLabel)        
        let anywhereCreditLabelTxt = await anywhereCreditLabel.text()
        anywhereCreditLabelTxt = anywhereCreditLabelTxt.replace(/[a-z]/gi,'').replace(':','').replace(/\s/g,'')
        let validateCurrency = anywhereCreditLabelTxt.includes('$')
        let validateAmount = anywhereCreditLabelTxt.replace('$','')
        let regexp =  /^\d+\.\d{0,2}?$/
        let correctAmount = regexp.test(validateAmount) && validateCurrency        
        expect(correctAmount).toBe(true)   
    })

    //MerchantCredit    
    test("Fourth discount displaying is [merchant name] Credit", async () => {      
        console.log("Fourth discount displaying is [merchant name] Credit")  
        let merchantCreditLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMerchantCreditLabel)        
        let merchantCreditLabelTxt = await merchantCreditLabel.text()
        expect(merchantCreditLabelTxt).toContain(`${merchantTest[0].name} Credit`)
    })

    test("Correct amount of credit is displaying with $ and two decimal places", async () => {         
        console.log("Correct amount of credit is displaying with $ and two decimal places")       
        let merchantCreditLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMerchantCreditLabel)        
        let merchantCreditLabelTxt = await merchantCreditLabel.text()
        merchantCreditLabelTxt = merchantCreditLabelTxt.replace(merchantTest[0].name,'')       
        merchantCreditLabelTxt = merchantCreditLabelTxt.replace(/[a-z]/gi,'').replace(':','').replace(/\s/g,'')        
        let validateCurrency = merchantCreditLabelTxt.includes('$')
        let validateAmount = merchantCreditLabelTxt.replace('$','')
        let regexp =  /^\d+\.\d{0,2}?$/
        let correctAmount = regexp.test(validateAmount) && validateCurrency        
        expect(correctAmount).toBe(true)   
    })

    //MOOCHO CASH
    test("Fifth discount displaying is Moocho Cash", async () => {        
        console.log("Fifth discount displaying is Moocho Cash")
        let moochoCash = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMoochoCash)        
        expect(moochoCash).not.toBe(null)
    })

    test("Correct amount of is displaying with $ and two decimal places", async () => {    
        console.log("Correct amount of is displaying with $ and two decimal places")            
        let moochoCashLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMoochoCashLabel)        
        let moochoCashLabelTxt = await moochoCashLabel.text()        
        moochoCashLabelTxt = moochoCashLabelTxt.replace(/[a-z]/gi,'').replace(':','').replace(/\s/g,'')        
        let validateCurrency = moochoCashLabelTxt.includes('$')
        let validateAmount = moochoCashLabelTxt.replace('$','')
        let regexp =  /^\d+\.\d{0,2}?$/
        let correctAmount = regexp.test(validateAmount) && validateCurrency        
        expect(correctAmount).toBe(true)   
    })

    //MOOCHO BONUS CASH
    test("Sixth discount displaying is Bonus Cash ", async () => {
        console.log("Sixth discount displaying is Bonus Cash ")        
        let moochoBonusCash = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMoochoBonusCash)        
        expect(moochoBonusCash).not.toBe(null)
    })

    test("Correct amount of is displaying with $ and two decimal places", async () => {
        console.log("Correct amount of is displaying with $ and two decimal places")                
        let moochoBonusCashLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMoochoBonusCashLabel)        
        let moochoBonusCashLabelTxt = await moochoBonusCashLabel.text()        
        moochoBonusCashLabelTxt = moochoBonusCashLabelTxt.replace(/[a-z]/gi,'').replace(':','').replace(/\s/g,'')        
        let validateCurrency = moochoBonusCashLabelTxt.includes('$')
        let validateAmount = moochoBonusCashLabelTxt.replace('$','')
        let regexp =  /^\d+\.\d{0,2}?$/
        let correctAmount = regexp.test(validateAmount) && validateCurrency        
        expect(correctAmount).toBe(true)   
    })

    test("discount dropdown collapses", async () => {
        console.log("discount dropdown collapses")
        let closeDiscounts = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarBodyCloseButton)
        await closeDiscounts.click()        
        let discountBody = await findIosElement(structure.giftCardActivity.giftCardViewDiscountBarBody,driver)        
        expect(discountBody).toBe(false)   
    })
    
})

describe("4. [Account A] Min/Max Button Behavior", () => {    
    console.log("4. [Account A] Min/Max Button Behavior")

    test("'Pay Now' button remains disabled and Min / Max are displaying below", async () => {
        console.log("'Pay Now' button remains disabled and Min / Max are displaying below")
        let number4 = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberFour)
        await number4.click()    
        let numberDoubleZero = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberDoubleZero)
        await numberDoubleZero.click()

        let minValue = await findIosElement(structure.giftCardActivity.giftCardViewMinLabel,driver)
        let maxValue = await findIosElement(structure.giftCardActivity.giftCardViewMaxLabel,driver)
        let payButton =  await driver.elementById(structure.giftCardActivity.giftCardViewPayButton)
        let status = await payButton.isEnabled()

        let clearAmount = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberBack)
        let i=0;
        while (i <= 2) {
            await clearAmount.click()
            i++;
        }    
        expect(minValue).toBe(true)
        expect(maxValue).toBe(true)
        expect(status).toBe(false)

    })

    test("'Pay Now' button becomes enabled and Min / Max no longer displays below", async () => {
        console.log("'Pay Now' button becomes enabled and Min / Max no longer displays below")
        let number6 = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberSix)
        await number6.click()    
        let numberDoubleZero = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberDoubleZero)
        await numberDoubleZero.click()
    
        let minValue = await findIosElement(structure.giftCardActivity.giftCardViewMinLabel,driver)
        let maxValue = await findIosElement(structure.giftCardActivity.giftCardViewMaxLabel,driver)
        let payButton =  await driver.elementById(structure.giftCardActivity.giftCardViewPayButton)
        let status = await payButton.isEnabled()
        let clearAmount = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberBack)
        let i=0;
        while (i <= 2) {
            await clearAmount.click()
            i++;
        }    

        expect(minValue).toBe(false)
        expect(maxValue).toBe(false)
        expect(status).toBe(true)
    
    })

    test("'Pay Now' is disabled and Mix / Max are displaying below", async () => {
        console.log("'Pay Now' is disabled and Mix / Max are displaying below")
        let number6 = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberSix)
        await number6.click()    
        let numberDoubleZero = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberDoubleZero)
        await numberDoubleZero.click()
        await numberDoubleZero.click()

        let minValue = await findIosElement(structure.giftCardActivity.giftCardViewMinLabel,driver)
        let maxValue = await findIosElement(structure.giftCardActivity.giftCardViewMaxLabel,driver)
        let payButton =  await driver.elementById(structure.giftCardActivity.giftCardViewPayButton)
        let status = await payButton.isEnabled()
        let clearAmount = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberBack)
        let i=0;

        while (i <= 4) {
            await clearAmount.click()
            i++;
        }    

        expect(minValue).toBe(true)
        expect(maxValue).toBe(true)
        expect(status).toBe(false)

    })
})

describe("5. [Account A] Invoice Pop Up — Deal", () => {
    console.log("5. [Account A] Invoice Pop Up — Deal")

    test("'You'll pay...' with correct amount to be charged to card and (i) button appears", async () => {
        console.log("'You'll pay...' with correct amount to be charged to card and (i) button appears")
        let number4 = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberFour)
        await number4.click()    
        let numberDoubleZero = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberDoubleZero)
        await numberDoubleZero.click()
        await numberDoubleZero.click()         
        await waitForElementUntilDisappear(structure.giftCardActivity.giftCardViewYouWillPayLoading,driver)
        let youwillPayLabel = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayLabel)
        let youWillPayButton = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayButton)        
        expect(youwillPayLabel).not.toBe(null)
        expect(youWillPayButton).not.toBe(null)        
    })

    test("pop up appears", async () => {
        console.log("pop up appears")
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

    test("Correct amount entered", async () => {
        console.log("Correct amount entered")
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)
        let totalBIllTxt = await totalBill.text()                
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()                
        let validateAmount = (totalBIllTxt === amountCalculatorTxt)
        expect(validateAmount).toBe(true)
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
        //thisGonaFail
        let anyWhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCredit2)        
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
        //thisGonaFail
        let merchantCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchant2)        
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
        //thisGonaFail
        let moochoCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCash2)        
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
        let bonusCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonus2)        
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
    test("Correct amount to be charged on card is displayed (total bill minus value of all discounts)", async () => {    
        console.log("Correct amount to be charged on card is displayed (total bill minus value of all discounts)")    
        let dealDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDealValue)
        let merchantDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchantValue)
        let moochoCashDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCashValue)
        let bonusCashDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonusValue)
        let anyWhereDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCreditValue)
        let cardOnFileValue = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCardOnFileValue)
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)

        let totalBillTxt = await totalBill.text()
        let cardOnFileValueTxt = await cardOnFileValue.text()
        let dealDiscountTxt = await dealDiscount.text()
        let merchantDiscountTxt = await merchantDiscount.text()
        let moochoCashDiscountTxt = await moochoCashDiscount.text()
        let bonusCashDiscountTxt = await bonusCashDiscount.text()
        let anyWhereDiscountTxt = await anyWhereDiscount.text()

        totalBillTxt = totalBillTxt.replace('$','')
        cardOnFileValueTxt = cardOnFileValueTxt.replace('$','')
        dealDiscountTxt = dealDiscountTxt.replace('-$','')
        merchantDiscountTxt = merchantDiscountTxt.replace('-$','')
        moochoCashDiscountTxt = moochoCashDiscountTxt.replace('-$','')
        bonusCashDiscountTxt = bonusCashDiscountTxt.replace('-$','')
        anyWhereDiscountTxt = anyWhereDiscountTxt.replace('-$','')

        let sumDiscount = ( parseFloat(dealDiscountTxt) + 
                            parseFloat(merchantDiscountTxt) + 
                            parseFloat(moochoCashDiscountTxt) + 
                            parseFloat(bonusCashDiscountTxt) + 
                            parseFloat(anyWhereDiscountTxt))

        let billMinusDiscounts = (parseFloat(totalBillTxt) - sumDiscount)
        let cardOnFile = parseFloat(cardOnFileValueTxt)
                            
        expect(billMinusDiscounts).toBe(cardOnFile)
        
    })

    test("discount dropdown collapses", async () => {
        console.log("discount dropdown collapses")
        let closePayDetail = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCloseButton)
        await closePayDetail.click()        
        let discountBody = await findIosElement(structure.giftCardActivity.giftCardViewPayDetailView,driver)        
        expect(discountBody).toBe(false)   
    })

})

describe("6. [Account A] Discount Dropdown — Cannot Afford Reward", () => {
    console.log("6. [Account A] Discount Dropdown — Cannot Afford Reward")

    test("Reward pop up appears", async () => {
        console.log("Reward pop up appears")
        let openDiscounts = await driver.elementById(structure.giftCardActivity.giftCardViewOpenDiscountsButton)
        await openDiscounts.click()        
        await driver.waitForElementById(structure.giftCardActivity.giftCardViewDiscountBarBody, asserters.isDisplayed, 20000, 100);        
        let openReward = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardButton)
        await openReward.click()
        let rewardView = await driver.waitForElementById(structure.rewardActivity.rewardScreen, asserters.isDisplayed, 20000, 100);        
        expect(rewardView).not.toBe(null)
    })
    test("text appears that says 'YOURS FREE FOR [M] [AMOUNT]'", async () => {
        console.log("text appears that says 'YOURS FREE FOR [M] [AMOUNT]'")
        let yourFreeLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForLabel)
        let yourFreeLabelTxt = await yourFreeLabel.text()        
        let yourFreeIcon = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForLabelIcon)
        let yourFreeMooches = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForMooches)
        expect(yourFreeLabelTxt).toContain("YOURS FREE FOR")
        expect(yourFreeMooches).not.toBe(null)
        expect(yourFreeIcon).not.toBe(null)
    })
    test("button on pop up is disabled / not clickable", async () => {
        console.log("button on pop up is disabled / not clickable")
        let rewardGetButton = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButton)        
        let buttonStatus = await rewardGetButton.isEnabled()
        expect(rewardGetButton).not.toBe(null)
        expect(buttonStatus).toBe(false)
    })
    test("button on pop up says 'EARN [XX] MORE MOOCHES TO GET IT!'", async () => {
        console.log("button on pop up says 'EARN [XX] MORE MOOCHES TO GET IT!'")
        let rewardGetButtonLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButtonLabel)        
        let rewardGetButtonLabelTxt = await rewardGetButtonLabel.text()     
        rewardGetButtonLabelTxt = rewardGetButtonLabelTxt.replace(/[0-9]/g, '')
        expect(rewardGetButtonLabelTxt).toContain("EARN  MORE MOOCHES TO GET IT!")
    })
    test("confirm XX is correct amount based on user's Mooches and price of reward", async () => {
        console.log("confirm XX is correct amount based on user's Mooches and price of reward")
        let getUserMooches = await api.post(structure.settingsProject.urlGetUserMooches,{"email": userTest[0].email})
        let userMooches = Number(getUserMooches.data[0].MoochesAvailable)
        let rewardMoochesRequired = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForMooches)
        let rewardMoochesRequiredTxt = await rewardMoochesRequired.text()        
        let rewardGetButtonLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButtonLabel)        
        let rewardGetButtonLabelTxt = await rewardGetButtonLabel.text()     
        let numberFromButton = rewardGetButtonLabelTxt.replace( /[^0-9]/g, '');
        let result = parseInt(rewardMoochesRequiredTxt) - userMooches
        let validateResult = (result === parseInt(numberFromButton))
        expect(validateResult).toBe(true)        
    })

    test("pop up disappears", async () => {        
        console.log("pop up disappears")
        let closeRewardView = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardCloseButton)
        await closeRewardView.click()
        let giftCardScreen = await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 20000, 100)
        expect(giftCardScreen).not.toBe(null)
    })

    afterAll(async () => {    
    let btnBack = await driver.waitForElementById(structure.giftCardActivity.giftCardViewCloseBtn, asserters.isDisplayed, 20000, 100)
    await btnBack.click()    
    })
    
})

describe("7. [Account A] Discount Dropdown — Claim Reward", () => {
    console.log("7. [Account A] Discount Dropdown — Claim Reward")
    beforeAll(async () => {    
        //update mooches
        await api.post(structure.settingsProject.urlUpdateUserMooches,{"email": userTest[0].email,"value": 0})
        await api.post(structure.settingsProject.urlUpdateUserMooches,{"email": userTest[0].email,"value": 20})
        let homeBtn = await driver.elementById(structure.dashboardActivity.btnHome)
        await homeBtn.click()
        let loadingIsActive = await findIosElement(structure.dashboardActivity.loadingScreen, driver)  
        
        if(loadingIsActive){
            await waitForElementUntilDisappear(structure.dashboardActivity.loadingScreen, driver);
        }
        
        // open merchant
        let merchantItem = await driver.elementById(merchantTest[0].name)
        await merchantItem.click()
        //await for egift view
        await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 60000, 100);
    })

    test("Reward pop up appears", async () => {
        console.log("Reward pop up appears")
        let openDiscounts = await driver.elementById(structure.giftCardActivity.giftCardViewOpenDiscountsButton)
        await openDiscounts.click()        
        await driver.waitForElementById(structure.giftCardActivity.giftCardViewDiscountBarBody, asserters.isDisplayed, 20000, 100);        
        let openReward = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardButton)
        await openReward.click()
        let rewardView = await driver.waitForElementById(structure.rewardActivity.rewardScreen, asserters.isDisplayed, 20000, 100);        
        expect(rewardView).not.toBe(null)
    })
    test("text appears that says 'YOURS FREE FOR [M] [AMOUNT]'", async () => {
        console.log("text appears that says 'YOURS FREE FOR [M] [AMOUNT]'")
        let yourFreeLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForLabel)
        let yourFreeLabelTxt = await yourFreeLabel.text()        
        let yourFreeIcon = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForLabelIcon)
        let yourFreeMooches = await driver.elementById(structure.rewardActivity.rewardDetailViewYoursFreeForMooches)
        expect(yourFreeLabelTxt).toContain("YOURS FREE FOR")
        expect(yourFreeMooches).not.toBe(null)
        expect(yourFreeIcon).not.toBe(null)
    })
    test("button on pop up is enabled", async () => {
        console.log("button on pop up is enabled")
        let rewardGetButton = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButton)        
        let buttonStatus = await rewardGetButton.isEnabled()
        expect(rewardGetButton).not.toBe(null)
        expect(buttonStatus).toBe(true)
    })
    test("button on pop up says 'GET IT NOW!'", async () => {
        console.log("button on pop up says 'GET IT NOW!'")
        let rewardGetButtonLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButtonLabel)        
        let rewardGetButtonLabelTxt = await rewardGetButtonLabel.text()             
        expect(rewardGetButtonLabelTxt).toContain("GET IT NOW!")
    })
    test("text on button changes to 'GETTING IT!...'", async () => {
        console.log("text on button changes to 'GETTING IT!...'")
        let rewardGetButton = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButton)        
        await rewardGetButton.click()
        let rewardGetButtonLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButtonLabel)        
        let rewardGetButtonLabelTxt = await rewardGetButtonLabel.text()             
        expect(rewardGetButtonLabelTxt).toContain("GETTING IT!...")
    })
    test("text on button changes to 'USE IT NOW!'", async () => {        
        console.log("text on button changes to 'USE IT NOW!'")
        let rewardGetButtonLabel = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButtonLabel)        
        let rewardGetButtonLabelTxt = await rewardGetButtonLabel.text()             
        expect(rewardGetButtonLabelTxt).toContain("USE IT NOW!")
    })
    test("Tap 'USE IT NOW!'", async () => {   
        console.log("Tap 'USE IT NOW!'")     
        let rewardGetButton = await driver.elementById(structure.rewardActivity.rewardDetailViewGetRewardButton)        
        await rewardGetButton.click()
        let giftCardScreen = await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 20000, 100)
        expect(giftCardScreen).not.toBe(null)        
    })
    test("pop up collapses", async () => {  
        console.log("pop up collapses")      
        let rewardPopUp = await findIosElement(structure.rewardActivity.rewardScreen,driver)        
        expect(rewardPopUp).toBe(false)        
    })
    test("discount dropdown collapses", async () => {  
        console.log("discount dropdown collapses")      
        let discountBody = await findIosElement(structure.giftCardActivity.giftCardViewDiscountBarBody,driver)        
        expect(discountBody).toBe(false)        
    })
    test("button on Reward now says 'SEE DETAILS'", async () => {  
        console.log("button on Reward now says 'SEE DETAILS'")      
        let openDiscounts = await driver.elementById(structure.giftCardActivity.giftCardViewOpenDiscountsButton)
        await openDiscounts.click()        
        await driver.waitForElementById(structure.giftCardActivity.giftCardViewDiscountBarBody, asserters.isDisplayed, 20000, 100); 
        let rewardDiscountButton = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardButtonLabel)
        let rewardDiscountButtonTxt = await rewardDiscountButton.text()
        expect(rewardDiscountButtonTxt).toBe("SEE DETAILS")
    })    
})

describe("8. [Account A] Invoice Pop Up — Reward", () => {
    console.log("8. [Account A] Invoice Pop Up — Reward")

    test("'You'll pay...' with correct amount to be charged to card and (i) button appears", async () => {
        console.log("'You'll pay...' with correct amount to be charged to card and (i) button appears")
        let number4 = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberFour)
        await number4.click()    
        let numberDoubleZero = await driver.elementById(structure.giftCardActivity.giftCardCardViewCalculator.giftCardCardViewCalculatorNumberDoubleZero)
        await numberDoubleZero.click()
        await numberDoubleZero.click()         
        await waitForElementUntilDisappear(structure.giftCardActivity.giftCardViewYouWillPayLoading,driver)
        let youwillPayLabel = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayLabel)
        let youWillPayButton = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayButton)        
        expect(youwillPayLabel).not.toBe(null)
        expect(youWillPayButton).not.toBe(null)        
    })

    test("pop up appears", async () => {
        console.log("pop up appears")
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

    test("Correct amount entered", async () => {
        console.log("Correct amount entered")
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)
        let totalBIllTxt = await totalBill.text()                
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()                
        let validateAmount = (totalBIllTxt === amountCalculatorTxt)
        expect(validateAmount).toBe(true)
    })

    //REWARD
    test("Next line is 'Minus Reward discount:'", async () => {
        console.log("Next line is 'Minus Reward discount:'")
        let minusDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewReward)        
        expect(minusDiscount).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {
        console.log("Correct amount is displayed with minus sign in front of it")
        let minusDiscountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewRewardValue)        
        let minusDiscountAmountTxt = await minusDiscountAmount.text()
        let validateAmount = minusDiscountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })
    test("Correct Headline of Reward discount is displayed in gold text underneath Reward discount line", async () => {        
        console.log("Correct Headline of Reward discount is displayed in gold text underneath Reward discount line")
        let minusDiscountName = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewRewardName)        
        let minusDiscountAmountTxt = await minusDiscountName.text()                
        expect(minusDiscountAmountTxt).not.toBe("Applicable Discount!")
    })

    //ANYWHERE CREDIT
    test("Next line is 'Minus Anywhere Credit:'", async () => {
        console.log("Next line is 'Minus Anywhere Credit:'")
        //thisGonaFail
        let anyWhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCredit2)        
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
        //thisGonaFail
        let merchantCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchant2)        
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
        //thisGonaFail
        let moochoCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCash2)        
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
        let bonusCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonus2)        
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
    test("Correct amount to be charged on card is displayed (total bill minus value of all discounts)", async () => {
        console.log("Correct amount to be charged on card is displayed (total bill minus value of all discounts)")
        let rewardDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewRewardValue)
        let merchantDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchantValue)
        let moochoCashDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCashValue)
        let bonusCashDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonusValue)
        let anyWhereDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCreditValue)
        let cardOnFileValue = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCardOnFileValue)
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)

        let totalBillTxt = await totalBill.text()
        let cardOnFileValueTxt = await cardOnFileValue.text()
        let rewardDiscountTxt = await rewardDiscount.text()
        let merchantDiscountTxt = await merchantDiscount.text()
        let moochoCashDiscountTxt = await moochoCashDiscount.text()
        let bonusCashDiscountTxt = await bonusCashDiscount.text()
        let anyWhereDiscountTxt = await anyWhereDiscount.text()

        totalBillTxt = totalBillTxt.replace('$','')
        cardOnFileValueTxt = cardOnFileValueTxt.replace('$','')
        rewardDiscountTxt = rewardDiscountTxt.replace('-$','')
        merchantDiscountTxt = merchantDiscountTxt.replace('-$','')
        moochoCashDiscountTxt = moochoCashDiscountTxt.replace('-$','')
        bonusCashDiscountTxt = bonusCashDiscountTxt.replace('-$','')
        anyWhereDiscountTxt = anyWhereDiscountTxt.replace('-$','')

        let sumDiscount = ( parseFloat(rewardDiscountTxt) + 
                parseFloat(merchantDiscountTxt) + 
                parseFloat(moochoCashDiscountTxt) + 
                parseFloat(bonusCashDiscountTxt) + 
                parseFloat(anyWhereDiscountTxt))

        let billMinusDiscounts = (parseFloat(totalBillTxt) - sumDiscount)
        let cardOnFile = parseFloat(cardOnFileValueTxt)
                
        expect(billMinusDiscounts).toBe(cardOnFile)

    })


afterAll(async () => {    
    let btnBack = await driver.waitForElementById(structure.giftCardActivity.giftCardViewCloseBtn, asserters.isDisplayed, 20000, 100)
    await btnBack.click()    
    })
})