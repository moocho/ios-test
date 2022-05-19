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
//   /*CLEAR USER STATUS*/
//  await api.post(structure.settingsProject.urlCleanAccountFlags,{"email": userTest[0].email})                
//   //ASK FOR DASHBOARD
//   let askForDashboard = await findIosElement(structure.dashboardActivity.dashboard,driver)        
//   if(!askForDashboard){              
//   await driver.waitForElementById(structure.launchActivity.launchScreen, asserters.isDisplayed, 60000, 100);
//   /*login PROCCESS*/
//   await login(driver,asserters,userTest[0].email,userTest[0].password)        
//   }

});

afterAll(async () => {
  await driver.quit();
});


describe("1. [Account A] Screen Display", () => {
    
    beforeAll(async () => {                
        //ASK FOR MERCHANT          
        let merchantItem = await driver.elementById(merchantTest[0].name)
        await merchantItem.click()
        //await for egift view
        await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 60000, 100);
        });

    test("top row of page displays merchant name with 'X' on right side", async () => {
        let merchantTitle = await driver.elementById(structure.giftCardActivity.giftCardViewMerchantName)
        let merchantTitleTxt = await merchantTitle.text()          
        expect(merchantTitleTxt.trim()).toBe('Winn-Dixie (5850 SW 73rd St)')                
    })

    test("hero image and merchant logo appear", async () => {
        let heroImage = await driver.elementById(structure.giftCardActivity.giftCardViewMerchantHeroImage)
        let logoImage = await driver.elementById(structure.giftCardActivity.giftCardViewMerchantLogo)
        expect(heroImage).not.toBe(null)
        expect(logoImage).not.toBe(null)           
    })
    
    test("text above number says 'Enter Check Out Amount'", async () => {
        let calculatorTitle = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorTitle)
        let calculatorTitleTxt = await calculatorTitle.text()
        expect(calculatorTitleTxt).toBe("Enter Check Out Amount")           
    })

    test("collapsed discount dropdown with 'You have discounts that can apply!' and down arrow is showing", async () => {
        let discountTitle = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarTitle)
        let discountTitleArrow = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarTitleArrow)
        let discountTitleTxt = await discountTitle.text()
        let discountTitleArrowTxt = await discountTitleArrow.text()            
        expect(discountTitleTxt).toBe("You have discounts that can apply!")
        expect(discountTitleArrowTxt).toBe("  ▼")
    })

    test("amount shows $0.00", async () => {
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()        
        expect(amountCalculatorTxt).toBe("$0.00")
    })

    test('"Pay Now" button is disabled and Min / Max are displaying below', async () => {
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
    
    test("pop up with 1, 2, and 3 graphics appears", async () => {
        let howtoPayBtn = await driver.elementById(structure.giftCardActivity.giftCardViewInfoStepsBtn)
        await howtoPayBtn.click()
        let howtoPayView = await driver.waitForElementById(structure.giftCardActivity.giftCardViewHowToPayView, asserters.isDisplayed, 20000, 100)
        expect(howtoPayView).not.toBe(null)
    })

    test("Transactions page opens", async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));        
        let howtoPayView = await driver.waitForElementById(structure.giftCardActivity.giftCardViewHowToPayView, asserters.isDisplayed, 20000, 100)
        expect(howtoPayView).not.toBe(null)
        let transactionBtn = await driver.elementById(structure.giftCardActivity.giftCardViewHowToPayViewTransactionButton)
        await transactionBtn.click()
        let transactionView = await driver.waitForElementById(structure.transactionsActivity.transactionScreen, asserters.isDisplayed, 20000, 100)
        expect(transactionView).not.toBe(null)
    })

    test("returns to Enter Total page and How To Pay Pop Up still appearing", async () => {        
        let closeTransactionBtn = await driver.elementById(structure.transactionsActivity.transactionHistoryViewCloseButton)
        await closeTransactionBtn.click()        
        let howtoPayView = await driver.waitForElementById(structure.giftCardActivity.giftCardViewHowToPayView, asserters.isDisplayed, 20000, 100)
        expect(howtoPayView).not.toBe(null)
    })

    test("pop up disappears", async () => {        
        let closeHowToPayBtn = await driver.elementById(structure.giftCardActivity.giftCardViewHowToPayViewCloseButton)
        await closeHowToPayBtn.click()
        let giftCardScreen = await driver.waitForElementById(structure.giftCardActivity.giftCardScreen, asserters.isDisplayed, 20000, 100)
        expect(giftCardScreen).not.toBe(null)
    })

});

describe("3. [Account A] Discount Dropdown — Deal & Reward (Unclaimed)", () => {
    
    test("discount dropdown expands with text 'Type below to see your discounts in action!' and up arrow", async () => {
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
        let dealDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDeal)        
        expect(dealDiscount).not.toBe(null)        
    })
    test("Deal icon displaying", async () => {        
        let dealDiscountIcon = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDealIcon)        
        expect(dealDiscountIcon).not.toBe(null)        
    })
    test("Correct Deal header text displaying", async () => {        
        let dealDiscountLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDealLabel)        
        expect(dealDiscountLabel).not.toBe(null)        
    })
    test("SEE DETAILS button displaying", async () => {        
        let dealDiscountButton = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountDealButton)        
        expect(dealDiscountButton).not.toBe(null)        
    })

    //REWARDS
    test("Second discount displaying is Reward", async () => {        
        let rewardDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountReward)        
        expect(rewardDiscount).not.toBe(null)        
    })
    test("Reward icon displaying", async () => {        
        let rewardDiscountIcon = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardIcon)        
        expect(rewardDiscountIcon).not.toBe(null)        
    })
    test("Correct Reward header text displaying", async () => {        
        let rewardDiscountLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardLabel)        
        expect(rewardDiscountLabel).not.toBe(null)        
    })
    test("GET NOW button displaying", async () => {        
        let rewardDiscountButton = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountRewardButton)        
        expect(rewardDiscountButton).not.toBe(null)        
    })

    //AnyWhereCredit
    test("Third discount displaying is Anywhere Credit", async () => {        
        let anywhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountAnywhereCredit)        
        expect(anywhereCredit).not.toBe(null)        
    })
    test("Correct amount of credit is displaying with $ and two decimal places", async () => {            
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
        let merchantCreditLabel = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMerchantCreditLabel)        
        let merchantCreditLabelTxt = await merchantCreditLabel.text()
        expect(merchantCreditLabelTxt).toContain(`${merchantTest[0].name} Credit`)
    })

    test("Correct amount of credit is displaying with $ and two decimal places", async () => {                
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
        let moochoCash = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMoochoCash)        
        expect(moochoCash).not.toBe(null)
    })

    test("Correct amount of is displaying with $ and two decimal places", async () => {                
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
        let moochoBonusCash = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountMoochoBonusCash)        
        expect(moochoCash).not.toBe(null)
    })

    test("Correct amount of is displaying with $ and two decimal places", async () => {                
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
        let closeDiscounts = await driver.elementById(structure.giftCardActivity.giftCardViewDiscountBarBodyCloseButton)
        await closeDiscounts.click()        
        let discountBody = await findIosElement(structure.giftCardActivity.giftCardViewDiscountBarBody,driver)        
        expect(discountBody).toBe(false)   
    })
    
})

describe("4. [Account A] Min/Max Button Behavior", () => {
    
    test("'Pay Now' button remains disabled and Min / Max are displaying below", async () => {
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
    
    test("'You'll pay...' with correct amount to be charged to card and (i) button appears", async () => {
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
        let youWillPayButton = await driver.elementById(structure.giftCardActivity.giftCardViewYouWillPayButton)
        youWillPayButton.click()        
        let payDetailPopUp = await driver.waitForElementById(structure.giftCardActivity.giftCardViewPayDetailView, asserters.isDisplayed, 20000, 100)
        expect(payDetailPopUp).not.toBe(null)
    })

    test("First line is 'Total bill:'", async () => {
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)        
        expect(totalBill).not.toBe(null)
    })

    test("Correct amount entered", async () => {
        let totalBill = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewTotalBill)
        let totalBIllTxt = await totalBill.text()                
        let amountCalculator = await driver.elementById(structure.giftCardActivity.giftCardViewCalculatorAmountLabel)
        let amountCalculatorTxt = await amountCalculator.text()                
        let validateAmount = (totalBIllTxt === amountCalculatorTxt)
        expect(validateAmount).toBe(true)
    })

    //DEALS
    test("Next line is 'Minus Deal discount:'", async () => {
        let minusDiscount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDeal)        
        expect(minusDiscount).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {
        let minusDiscountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDealValue)        
        let minusDiscountAmountTxt = await minusDiscountAmount.text()
        let validateAmount = minusDiscountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })
    test("Correct Headline of Deal discount is displayed in red text underneath Deal discount line", async () => {        
        let minusDiscountName = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewDealName)        
        let minusDiscountAmountTxt = await minusDiscountName.text()                
        expect(minusDiscountAmountTxt).not.toBe("Applicable Discount!")
    })

    //ANYWHERE CREDIT
    test("Next line is 'Minus Anywhere Credit:'", async () => {        
        //thisGonaFail
        let anyWhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCredit2)        
        expect(anyWhereCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {        
        let minusDiscountanyWhereCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewAnyWhereCreditValue)        
        let minusDiscountanyWhereCreditTxt = await minusDiscountanyWhereCredit.text()        
        let validateAmount = minusDiscountanyWhereCreditTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //MERCHANT CREDIT
    test("Next line is 'Minus [merchant name] Credit:'", async () => {        
        //thisGonaFail
        let merchantCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchant2)        
        expect(merchantCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {        
        let minusDiscountMerchantCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMerchantValue)        
        let minusDiscountMerchantCreditTxt = await minusDiscountMerchantCredit.text()              
        let validateAmount = minusDiscountMerchantCreditTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //MOOCHOCASH CREDIT
    test("Next line is 'Minus Moocho Cash:'", async () => {        
        //thisGonaFail
        let moochoCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCash2)        
        expect(moochoCashCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {        
        let discountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoCashValue)        
        let discountAmountTxt = await discountAmount.text()            
        let validateAmount = discountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //BONUSCASH CREDIT
    test("Next line is 'Minus Bonus Cash:'", async () => {        
        //thisGonaFail
        let bonusCashCredit = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonus2)        
        expect(bonusCashCredit).not.toBe(null)
    })
    test("Correct amount is displayed with minus sign in front of it", async () => {        
        let discountAmount = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewMoochoBonusValue)        
        let discountAmountTxt = await discountAmount.text()                   
        let validateAmount = discountAmountTxt.includes('-')        
        expect(validateAmount).toBe(true)
    })

    //CARD ON FILE
    test("Next line is 'Card on file:'", async () => {                
        let cardOnFile = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCardOnFileLabel)        
        expect(cardOnFile).not.toBe(null)
    })
    test("Correct amount to be charged on card is displayed (total bill minus value of all discounts)", async () => {        
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
        let closePayDetail = await driver.elementById(structure.giftCardActivity.giftCardViewPayDetailViewCloseButton)
        await closePayDetail.click()        
        let discountBody = await findIosElement(structure.giftCardActivity.giftCardViewPayDetailView,driver)        
        expect(discountBody).toBe(false)   
    })

})
// afterAll(async () => {    
//     let btnBack = await driver.waitForElementById(structure.giftCardActivity.giftCardViewCloseBtn, asserters.isDisplayed, 20000, 100)
//     await btnBack.click()    
//     })