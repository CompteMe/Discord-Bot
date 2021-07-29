module.exports.run = (client, message, args) => {
    if(args[0] === 'none'){
        client.chcam.delete(message.guild.id)
        message.channel.send('Désactivé !')
        return;
    }
    let ch = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    client.chcam.set(message.guild.id, ch.id)
    message.channel.send('Salon changé!\n\nPour désactiver taper `!setchannel none`')
};
module.exports.help = {
    name: "setchannel",
    description: "Permet de mettre le channel du 'compte-apres-moi'",
    permission: "MANAGE_GUILD",
    args: true,
    usage: '<#channel>'
};