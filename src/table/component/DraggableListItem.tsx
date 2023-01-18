import { Draggable } from 'react-beautiful-dnd';
import React from "react";

export interface DraggableListItemProps<T = any> {
    item: T;
    index: number;
    render: (item: T, index: number) => any;
    spaceBottom?: number;
};

const DraggableListItem = ({ item, index, render, spaceBottom }: DraggableListItemProps) => {
    return (
        <Draggable draggableId={index.toString()} index={index}>
            {(provided, snapshot) => <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`p-0 ${spaceBottom ? `mgb-${spaceBottom}` : ""}`}
                style={{ ...snapshot.isDragging ? { background: 'rgb(235,235,235)' } : {}, userSelect: "none" }}
            >
                {render(item, index)}
            </div>
            }
        </Draggable>
    );
};

export default DraggableListItem;
