import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Database from "../utils/database";
import { Button, IconButton, Menu, MenuItem, Modal, Typography } from "@mui/material";
import { NewTaskModal } from "./modals/NewTaskModal";
import { v4 as uuidv4 } from 'uuid';
import { EditTaskModal } from "./modals/EditTaskModal";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { NewCategoryModal } from "./modals/NewCategoryModal";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
var categoryToIdMap = Object.create(null);

export const TaskBoard = (props) => {
    const [columns, setColumns] = useState(Object.create(null));
    const [selectedTaskData, setSelectedTaskData] = useState(Object.create(null));
    const [selectedColumn, setSeletedColumn] = useState(Object.create(null));
    const [selectedColumnId, setSeletedColumnId] = useState("");
    const [anchorElement, setAnchorElement] = useState(null);

    // Modal and menu states
    const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
    const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleNewTaskModalOpen = () => setNewTaskModalOpen(true);
    const handleNewTaskModalClose = () => setNewTaskModalOpen(false);
    const handleNewCategoryModalOpen = () => setNewCategoryModalOpen(true);
    const handleNewCategoryModalClose = () => setNewCategoryModalOpen(false);
    const handleEditTaskModalOpen = () => setEditTaskModalOpen(true);
    const handleEditTaskModalClose = () => setEditTaskModalOpen(false);
    const handleMenuOpen = (e) => {
        setAnchorElement(e.target);
        setMenuOpen(true)
    };
    const handleMenuClose = () => setMenuOpen(false);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const oldCategoryName = sourceColumn.name;
            const newCategoryName = destColumn.name;
            const taskToRemove = sourceItems[source.index];

            Database.TeamManager.TasksManager.changeTaskCategory(
                props.teamId,
                oldCategoryName,
                newCategoryName,
                taskToRemove
            );

            sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, taskToRemove);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        }
    };

    const getTaskData = async (data) => {
        let columnsData = {};
        for (let index = 0; index < data.taskCategories.length; index++) {
            let categoryId = uuidv4();
            columnsData[categoryId] = {
                name: data.taskCategories[index],
                items: []
            };
            categoryToIdMap[data.taskCategories[index]] = categoryId;
        }
        for (let index = 0; index < data.tasks.length; index++) {
            let category = data.tasks[index].category;
            let categoryData = {
                id: data.tasks[index].id,
                title: data.tasks[index].title,
                description: data.tasks[index].description,
            }
            if (categoryToIdMap[category] !== undefined && 
                columnsData[categoryToIdMap[category]] !== undefined) {
                columnsData[categoryToIdMap[category]].items.push(categoryData);
            }
        }
        setColumns(columnsData);
    }

    const handleNewTask = (taskData) => {
        let columnsData = columns;
        let uploadData = {
            id: uuidv4(),
            ...taskData
        }
        columnsData[categoryToIdMap[taskData.category]].items.push(uploadData);
        Database.TeamManager.TasksManager.createNewTask(props.teamId, uploadData);
        setColumns(columnsData);
        handleNewTaskModalClose();
    }

    const handleTaskRemove = (columnId, column, item) => {
        Database.TeamManager.TasksManager.removeTask(props.teamId, { category: column.name, ...item });
        setColumns({
            ...columns,
            [columnId]: {
                ...column,
                items: column.items.filter((searchItem, index) => {
                    return searchItem !== item;
                })
            }
        });
    }
    const handleTaskUpdate = (taskData) => {
        setEditTaskModalOpen(false);
        Database.TeamManager.TasksManager.updateTaskData(
            props.teamId,
            { ...selectedTaskData, category: selectedColumn.name },
            { ...taskData, category: selectedColumn.name }
        );

        // replace the old team data with the new team data
        let tasks = [];
        for (let index = 0; index < selectedColumn.items.length; index++) {
            if (selectedColumn.items[index] === selectedTaskData) {
                tasks.push({ ...taskData, id: selectedColumn.items[index].id });
            } else {
                tasks.push(selectedColumn.items[index]);
            }
        }
        setColumns({
            ...columns,
            [selectedColumnId]: {
                ...selectedColumn,
                items: tasks
            }
        });
    }
    const handleNewCategory = (categoryName) => {
        handleNewCategoryModalClose();
        Database.TeamManager.TasksManager.createCategory(props.teamId, categoryName);
        let categoryId = uuidv4();
        setColumns({
            ...columns,
            [categoryId]: {
                name: categoryName,
                items: []
            }
        });
        categoryToIdMap[categoryName] = categoryId;
    }
    const handleCategoryRemove = () => {
        handleMenuClose();
        Database.TeamManager.TasksManager.removeCategory(props.teamId, selectedColumn.name);
        let updatedColumns = columns;
        delete updatedColumns[selectedColumnId];
        setColumns(columns);
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "protected_team_data", props.teamId), (snapshot) => {
            getTaskData(snapshot.data());
        });
        return () => unsubscribe;
    }, [props]);


    return (
        <>
            <Menu
                anchorEl={anchorElement}
                open={menuOpen}
                onClose={handleMenuClose}>
                <MenuItem onClick={handleCategoryRemove}>Delete</MenuItem>
            </Menu>
            <Modal open={newTaskModalOpen} onClose={handleNewTaskModalClose}>
                <NewTaskModal columns={columns} onNewTask={handleNewTask} />
            </Modal>
            <Modal open={editTaskModalOpen} onClose={handleEditTaskModalClose}>
                <EditTaskModal
                    columns={columns}
                    taskData={selectedTaskData}
                    onTaskDelete={() => {
                        handleTaskRemove(selectedColumnId, selectedColumn, selectedTaskData);
                        handleEditTaskModalClose();
                    }}
                    onTaskUpdate={handleTaskUpdate}
                />
            </Modal>
            <Modal open={newCategoryModalOpen} onClose={handleNewCategoryModalClose}>
                <NewCategoryModal onNewCategory={handleNewCategory} />
            </Modal>
            <div style={{ margin: 10 }}>
                <Button onClick={handleNewTaskModalOpen}>Create task</Button>
                <br />
                <div style={{ display: "flex", height: "100%", overflow: "scroll" }}>
                    <DragDropContext
                        onDragEnd={result => onDragEnd(result)}
                    >
                        {Object.entries(columns).map(([columnId, column], index) => {
                            return (
                                <div key={columnId}>
                                    <Typography variant="h6" style={{ display: "inline-block", marginLeft: 20, width: 200 }}>{column.name}</Typography>
                                    <IconButton onClick={(event) => {
                                        setSeletedColumn(column);
                                        setSeletedColumnId(columnId)
                                        handleMenuOpen(event);
                                    }}>
                                        <MoreHorizIcon />
                                    </IconButton>
                                    <Droppable droppableId={columnId} key={columnId}>
                                        {(provided, snapshot) => {
                                            return (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    style={{
                                                        background: snapshot.isDraggingOver
                                                            ? "var(--board-focus-color)"
                                                            : "var(--board-color)",
                                                        padding: 4,
                                                        borderRadius: 7,
                                                        width: 250,
                                                        height: 500,
                                                        overflow: "scroll",
                                                        margin: 8
                                                    }}
                                                >

                                                    {column.items.map((item, index) => {
                                                        return (
                                                            <Draggable
                                                                key={item.id}
                                                                draggableId={item.id}
                                                                index={index}
                                                            >
                                                                {(provided, snapshot) => {
                                                                    return (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={{
                                                                                userSelect: "none",
                                                                                padding: 16,
                                                                                margin: "0 0 8px 0",
                                                                                backgroundColor: snapshot.isDragging
                                                                                    ? "#1d2d33"
                                                                                    : "#2d454f",
                                                                                color: "white",
                                                                                borderRadius: 7,
                                                                                overflow: "auto",
                                                                                ...provided.draggableProps.style
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                style={{
                                                                                    verticalAlign: "middle",
                                                                                    display: "inline-block",
                                                                                    width: 170
                                                                                }}>{item.title}</Typography>
                                                                            {/* <IconButton onClick={() => { handleTaskRemove(columnId, column, item) }}>
                                                                                <MoreVertIcon />
                                                                            </IconButton> */}
                                                                            <IconButton onClick={() => {
                                                                                setSeletedColumn(column);
                                                                                setSeletedColumnId(columnId);
                                                                                setSelectedTaskData(item);
                                                                                handleEditTaskModalOpen();
                                                                            }}>
                                                                                <MoreVertIcon />
                                                                            </IconButton>

                                                                        </div>
                                                                    );
                                                                }}
                                                            </Draggable>
                                                        );
                                                    })}
                                                    {provided.placeholder}
                                                </div>
                                            );
                                        }}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </DragDropContext>
                    <div style={{ verticalAlign: "middle" }}>
                        <p style={{ paddingTop: 30 }}>
                            <Button startIcon={<AddIcon />} onClick={handleNewCategoryModalOpen}>Add board</Button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}