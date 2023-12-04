interface TeamProps {
    value: string;
    type: string;
};

export const weaponProps : Array<TeamProps> = [
    {value: "name", type: "string"},
    {value: "AT", type: "number"},
    {value: "FP", type: "number"},
    {value: "specials", type: "string"},
    {value: "firerate", type: "number"},
    {value: "range", type: "number"},
    {value: "game", type: "string"}
];