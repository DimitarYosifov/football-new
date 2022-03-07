import { InteractionEvent } from "pixi.js";

export interface IMoveCoordinates {
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
}

export interface IBlockPositions {
    img?: any;
    type?: any;
    blockImg?: any;
    children?: any;
    gridPosition?: any;
    row?: number;
    col?: number;
    shouldFall?: number;
    x: number;
    y: number;
    width?:number;
    height?:number;
}

export interface ISelectedBlock{
    row: number; 
    col: number; 
    type: string;
     oldX: number;
      oldY: number;
}

export interface IMatches{
    row: number; 
    col: number; 
    dir: string;
    beingSwapped:boolean;
    type:string;
    id:number
}

export interface IPossibleMoves{
    col: number;
    row: number;
    dir: string;
    matches: number;
    types:string[];
}

export interface IHolesInColumns{
    holes: number;
     onRow: number[];
}

export interface IDirections{
    left: number;
    right:  number;
    up: number;
    down:  number;
}

// export interface IEvent extends InteractionEvent{
//     gridPosition_x:number;
// }
