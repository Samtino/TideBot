const { EmbedBuilder } = require('discord.js');
const fetch = require('cross-fetch');
const client = require('../index.js');
require('dotenv').config();

const channelId = '1180996106679750768';
const interval = 5 * 1000;

async function createPlayerLists(playersArray) {
    const newArray = [];
    // split array into 3
    const splitArray = Math.ceil(playersArray.length / 3);
    for (let i = 0; i < 3; i++) {
        newArray.push(playersArray.slice(i * splitArray, i * splitArray + splitArray));
    }
    return newArray;
}

async function apiCall() {
    try {
        const serverInfo = `https://api.battlemetrics.com/servers/14442773`;

        const serverInfoResponse = await fetch(
            serverInfo + `?include=session`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BM_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        if (!serverInfoResponse.ok) {
			throw new Error(
				`${serverInfoResponse.status} - ${serverInfoResponse.statusText}`,
			);
		}

        const serverData = await serverInfoResponse.json();
        const { name, ip, port, players, maxPlayers, status } = serverData.data.attributes;
        const { map, gameMode, squad_teamOne, squad_teamTwo } = serverData.data.attributes.details;

        if (status === 'online') {
            var color = 'Green'
        } else {
            var color = 'Red'
        }

        // remove map name from team names
        const team1 = squad_teamOne.replace(map + '_', '')
        const team2 = squad_teamTwo.replace(map + '_', '')

        let playersArray = [];
        serverData.included.forEach((player) => {
            if (player.type === 'session') {
                let name = player.attributes.name;
                if (name.startsWith('[')) { // remove clan tags
                    const nameSplit = name.split(']');
                    name = nameSplit[1];
                }
                playersArray.push(name)
            }
        });
        playersArray.sort();

        const playerLists = await createPlayerLists(playersArray);
        
        const embed = new EmbedBuilder()
            .setTitle(name)
            .setDescription(`Connect with \`steam://connect/${ip}:${port}\``)
            .setColor(color)
            .addFields(
                { name: 'Map', value: `\`\`\`${map}\`\`\``, inline: true },
                { name: 'Game Mode', value: `\`\`\`${gameMode}\`\`\``, inline: true },
                { name: 'Players', value: `\`\`\`${players}/${maxPlayers}\`\`\``, inline: true },
                { name: 'Team 1', value: `\`\`\`${team1}\`\`\``, inline: true },
                { name: 'Team 2', value: `\`\`\`${team2}\`\`\``, inline: true },
            )
        const playerEmbed = new EmbedBuilder()
            .setColor(color)

        playerLists.forEach((list, index) => {
            if (index === 0) {
                playerEmbed.addFields( {
                    name: 'Players',
                    value: list.join('\n'),
                    inline: true
                })
                return;
            } else {
                playerEmbed.addFields( {
                    name: `\u200B`,
                    value: list.join('\n'),
                    inline: true
                })
            }
        });

        return [embed, playerEmbed];
    } catch (error) {
        console.error(error);
        return;
    }
}


setInterval(async () => {
    const channel = await client.channels.fetch(channelId);
    const [embed, playerEmbed] = await apiCall();

    await channel.messages.fetch({ limit: 1 }).then(messages => {
        const lastMessage = messages.first();
        if (lastMessage.author.id === client.user.id) {
            lastMessage.edit({ embeds: [embed, playerEmbed] });
        } else {
            channel.send({ embeds: [embed, playerEmbed] });
        }
    }).catch(console.error);
}, interval);

