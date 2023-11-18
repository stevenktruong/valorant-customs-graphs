export enum Player {
    Bree = "bree",
    Brandon = "brandon",
    Brian = "brian",
    Cade = "cade",
    Darwin = "darwin",
    Elke = "elke",
    Iram = "iram",
    Jason = "jason",
    Josh = "josh",
    Lindsey = "lindsey",
    Sophie = "sophie",
    Steve = "steve",
    Steven = "steven",
    Sun = "sun",
    Susi = "susi",
    Susu = "susu",
    Tang = "tang",
    Yang = "yang",
}

export const PLAYERS = Object.values(Player);

export const PLAYER_COLORS: Record<Player, [string, string, string, string]> = {
    [Player.Bree]: ["#5c64f4", "#6c7cf4", "#acb4fc", "#d7dafc"],
    [Player.Brandon]: ["#9192be", "#aa3824", "#ead67d", "#c8a592"],
    [Player.Brian]: ["#757e8a", "#447e8a", "#5c9da4", "#ffffff"],
    [Player.Cade]: ["#dbff9e", "#0f793e", "#479d56", "#91cb9e"],
    [Player.Darwin]: ["#cddbff", "#7f8ceb", "#ffc561", "#fffd8f"],
    [Player.Elke]: ["#60111f", "#9b2127", "#e59755", "#decdc2"],
    [Player.Iram]: ["#ecccd2", "#b39bee", "#2350c2", "#fb7de0"],
    [Player.Jason]: ["#00f1d2", "#a5ada2", "#e2e5de", "#02fb77"],
    [Player.Josh]: ["#faa61a", "#fead5b", "#fde7c1", "#ffffff"],
    [Player.Lindsey]: ["#92ced5", "#d1988d", "#ebd5ca", "#ffffff"],
    [Player.Sophie]: ["#b15c5d", "#daa379", "#dab79a", "#ffffff"],
    [Player.Steve]: ["#2180ba", "#43815f", "#7ca7a0", "#a3cdd9"],
    [Player.Steven]: ["#f8f4a6", "#e69470", "#8bbece", "#eec6c7"],
    [Player.Sun]: ["#dccdca", "#20878c", "#58bfc4", "#85d3e8"],
    [Player.Susi]: ["#556371", "#bf8d68", "#e7b897", "#f7c1d6"],
    [Player.Susu]: ["#cb759c", "#987d68", "#afa392", "#ffffff"],
    [Player.Tang]: ["#cea891", "#998e91", "#f2d5cf", "#ffffff"],
    [Player.Yang]: ["#c62c38", "#c64049", "#e86f68", "#ffffff"],
};

export const PLAYER_TAG: Record<Player, string> = {
    [Player.Brandon]: "JHardRTolkien",
    [Player.Bree]: "Brioche",
    [Player.Brian]: "brianwoohoo",
    [Player.Cade]: "RhythmKing",
    [Player.Darwin]: "ChzGorditaCrunch",
    [Player.Elke]: "Uzumaki 好き",
    [Player.Iram]: "march 7 inches",
    [Player.Jason]: "wayson",
    [Player.Josh]: "bot001341",
    [Player.Lindsey]: "honey butter",
    [Player.Sophie]: "chushberry",
    [Player.Steve]: "Selintt",
    [Player.Steven]: "youngsmasher",
    [Player.Sun]: "sun",
    [Player.Susi]: "SusTwins",
    [Player.Susu]: "danielscutiegf",
    [Player.Tang]: "tangy",
    [Player.Yang]: "Tyblerone",
};

export enum ValorantAgent {
    Astra = "Astra",
    Breach = "Breach",
    Brimstone = "Brimstone",
    Chamber = "Chamber",
    Cypher = "Cypher",
    Deadlock = "Deadlock",
    Fade = "Fade",
    Gekko = "Gekko",
    Harbor = "Harbor",
    Iso = "Iso",
    Jett = "Jett",
    Kayo = "KAY/O",
    Killjoy = "Killjoy",
    Neon = "Neon",
    Omen = "Omen",
    Phoenix = "Phoenix",
    Raze = "Raze",
    Reyna = "Reyna",
    Sage = "Sage",
    Skye = "Skye",
    Sova = "Sova",
    Viper = "Viper",
    Yoru = "Yoru",
}

export const AGENT_COLORS: Record<ValorantAgent, [string, string]> = {
    [ValorantAgent.Astra]: ["#5950a1", "#272359"],
    [ValorantAgent.Breach]: ["#af451f", "#41261f"],
    [ValorantAgent.Brimstone]: ["#a43a01", "#251c20"],
    [ValorantAgent.Chamber]: ["#72490e", "#1c2d3a"],
    [ValorantAgent.Cypher]: ["#754d36", "#192342"],
    [ValorantAgent.Deadlock]: ["#c6ae8e", "#645656"],
    [ValorantAgent.Fade]: ["#44314e", "#1b1426"],
    [ValorantAgent.Gekko]: ["#44314e", "#1b1426"],
    [ValorantAgent.Harbor]: ["#466095", "#1d2b51"],
    [ValorantAgent.Iso]: ["#8c6efe", "#31336b"],
    [ValorantAgent.Jett]: ["#336676", "#172a3c"],
    [ValorantAgent.Kayo]: ["#2c368a", "#1f1e4a"],
    [ValorantAgent.Killjoy]: ["#f0c344", "#3f215b"],
    [ValorantAgent.Neon]: ["#4886c1", "#363a8d"],
    [ValorantAgent.Omen]: ["#333f7c", "#0e1625"],
    [ValorantAgent.Phoenix]: ["#ce6230", "#1b1f26"],
    [ValorantAgent.Raze]: ["#b64b2f", "#7b3428"],
    [ValorantAgent.Reyna]: ["#712b6c", "#31193e"],
    [ValorantAgent.Sage]: ["#438291", "#1c2e32"],
    [ValorantAgent.Skye]: ["#3e573c", "#222015"],
    [ValorantAgent.Sova]: ["#3b5a91", "#202d5b"],
    [ValorantAgent.Viper]: ["#1b6f3a", "#203e32"],
    [ValorantAgent.Yoru]: ["#4259a8", "#19233d"],
};

export enum ValorantMap {
    Ascent = "Ascent",
    Bind = "Bind",
    Breeze = "Breeze",
    Fracture = "Fracture",
    Haven = "Haven",
    Icebox = "Icebox",
    Lotus = "Lotus",
    Pearl = "Pearl",
    Split = "Split",
    Sunset = "Sunset",
}

export const MAP_COLORS: Record<ValorantMap, string> = {
    Ascent: "#a79cd0",
    Bind: "#b9835d",
    Breeze: "#649ab1",
    Fracture: "#4f6740",
    Haven: "#8f5142",
    Icebox: "#48609a",
    Lotus: "#faa3d1",
    Pearl: "#3cb7c6",
    Split: "#808488",
    Sunset: "#f8b575",
};
