const express = require('express');
const router = express.Router();
const { updateRoutineActivity, canEditRoutineActivity, destroyRoutineActivity, getRoutineActivityById, getAllRoutineActivities } = require('../db');
const client = require('../db/client');
const { requireUser, requiredNotSent } = require('./utils')


//GET /api/routine_activities/:routineActivityId
//in postman POST request to login as sandra
//input her token into Authorization
//in the body input "duration and count and change them"
//click send, duration is 10 now and count is 20 for activity 4.
router.get("/", async (req, res, next) => {
  try {
    const routines = await getAllRoutineActivities();
    res.send(routines);
  } catch (error) {
    next(error);
  }
})


// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', requireUser, requiredNotSent({requiredParams: ['count', 'duration'], atLeastOne: true}), async (req, res, next) => {
  try {
    const {count, duration} = req.body;
    const {routineActivityId} = req.params;
    const routineActivityToUpdate = await getRoutineActivityById(routineActivityId);
    if(!routineActivityToUpdate) {
      next({
        name: 'NotFound',
        message: `No routine_activity found by ID ${routineActivityId}`
      })
    } else {
      if(!await canEditRoutineActivity(req.params.routineActivityId, req.user.id)) {
        res.status(403);
        next({name: "Unauthorized", message: "You cannot edit this routine_activity!"});
      } else {
        const updatedRoutineActivity = await updateRoutineActivity({id: req.params.routineActivityId, count, duration})
        res.send(updatedRoutineActivity);
      }
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
//once authorized, you can input the route by ID
//DELETE click Submit and it deletes.
//confirmed the GET request its gone.
router.delete('/:routineActivityId', requireUser, async (req, res, next) => {
  try {
    if(!await canEditRoutineActivity(req.params.routineActivityId, req.user.id)) {
      res.status(403);
      next({name: "Unauthorized", message: "You cannot edit this routine_activity!"});
    } else {
      const deletedRoutineActivity = await destroyRoutineActivity(req.params.routineActivityId)
      res.send({success: true, ...deletedRoutineActivity});
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
