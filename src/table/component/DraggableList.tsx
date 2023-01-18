import * as React from 'react';
import DraggableListItem from './DraggableListItem';
import {
    Direction,
    DragDropContext,
    Droppable,
    OnDragEndResponder
} from 'react-beautiful-dnd';

export interface DraggableListProps<T = any> {
    items: T[];
    onDragEnd: OnDragEndResponder;
    render: (item: T, index: number) => any;
    spaceBottom?: number;
    direction?: Direction;
};

const BgsDraggableList = React.memo(({ items, onDragEnd, render, spaceBottom, direction ="vertical" }: DraggableListProps) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list" direction={direction}>
                {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {React.Children.toArray(items.map((item, index) => <DraggableListItem spaceBottom={spaceBottom} render={render} item={item} index={index} />))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
});

export default BgsDraggableList;
