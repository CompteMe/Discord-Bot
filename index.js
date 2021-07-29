const { Client, Collection, MessageEmbed} = require('discord.js');
const client = new Client();
const { token } = require('./config.json')
const fs = require('fs')

const easydb = require('easy-json-database')
const Discord = require("discord.js");
const chcam = new easydb('./chcam.json')
const count = new easydb('./count.json')

client.chcam = chcam;
client.count = count;
client.commands = new Collection()

const loadCommands = (dir = "./commands/") => {
    console.log('Loading commands...');
    fs.readdirSync(dir).forEach(dirs => {
        const commands = fs.readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
        for (const file of commands) {
            const getFileName = require(`${dir}/${dirs}/${file}`);
            if (!getFileName.help) console.error('[Commands] No help for file: ' + file, true);
            if (!getFileName.help.name) console.error('[Commands] No name for file: ' + file, true)
            client.commands.set(getFileName.help.name, getFileName);
            if(getFileName.help.maintenance) console.log(`[Commands] ${getFileName.help.name} is on maintenance mode.`);
            console.log(`[Commands] Commande chargée : ${getFileName.help.name}`);
        }
    })
};
loadCommands()

client.on('ready', () => {
    console.log('Ready')
    client.user.setActivity('compter avec Compted#1509', {type: 'PLAYING'})
});
const prefix = "!";
client.on('message', msg => {
    if(msg.author.bot) return;
    if(client.chcam.has(msg.guild.id)) {
        if(!client.count.has(msg.guild.id)) client.count.set(msg.guild.id, 0)
        if(msg.channel.id === client.chcam.get(msg.guild.id)){
            const c = (client.count.get(msg.guild.id) + 1)
            console.log(c)
            if(c === Number(msg.content)) {
                client.count.add(msg.guild.id, 1)
            } else {
                const errorembed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('Mauvais nombre')
                    .setDescription(`Tu dois mettre le nombre \`${(client.count.get(msg.guild.id) + 1)}\``)
                msg.channel.send(errorembed).then(m => m.delete({timeout: 5000}));
                msg.delete();
                return
            }
        }
    }
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    const args = msg.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
    if (!command) return;
    if (command.help.args && !args.length) {
        let noArgsReply = `Il nous faut des arguments pour cette commande, ${msg.author}!`;

        if (command.help.usage) noArgsReply += `\nVoici comment utiliser la commande: \`${prefix}${command.help.name} ${command.help.usage}\``;

        return msg.channel.send(noArgsReply);
    }
    if (command.help.permission) {
            if (!msg.member.hasPermission(command.help.permission)) {
                return msg.channel.send(`Tu n'as pas la permission requise (${command.help.permission})`)
        }
    }

    command.run(client, msg, args);
    if (msg.author.bot) return false;
});

client.login(token)