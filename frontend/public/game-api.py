"""Controlled learning API: produces JSON commands, never JavaScript source."""
import json as _pv_json
import builtins as _pv_builtins
import math as _pv_math
_pv_state = _pv_json.loads(_pv_initial_json)
_pv_commands = []
def _pv_emit(op, value=None):
    if len(_pv_commands) >= 300:
        raise RuntimeError('Action limit: use at most 300 game commands per run.')
    command = {'op': op}
    if value is not None:
        command['value'] = value
    _pv_commands.append(command)
def _pv_move(step, jumping=False):
    s = _pv_state
    if s['health'] <= 0:
        _pv_emit('jump' if jumping else 'move', None if jumping else step)
        return
    target = max(0, min(8, s['position'] + step))
    s['moves'] += 1
    if s['doorPosition'] == target and not s['doorOpen']:
        s['message'] = 'Door locked. Find the key and use_key().'
    elif s['enemyPosition'] == target and s['enemyHealth'] > 0:
        s['health'] = max(0, s['health'] - (5 if s['defending'] else 25))
        s['defending'] = False
        s['message'] = 'Enemy blocks the path. Attack from the adjacent tile.'
    elif target in s['hazards'] and not jumping:
        s['health'] = max(0, s['health'] - 25)
        s['position'] = s['checkpoint']
        s['message'] = 'Spikes! Returned to checkpoint. Use jump() before the hazard.'
    else:
        s['position'] = target
        if s['keyPosition'] == target:
            s['key'] = True
            s['keyPosition'] = None
            s['message'] = 'Key collected. Call use_key() to unlock the door.'
        if s['checkpointPosition'] == target:
            s['checkpoint'] = target
            s['message'] = 'Checkpoint activated.'
    _pv_emit('jump' if jumping else 'move', None if jumping else step)

def move_forward(): _pv_move(1)
def move_backward(): _pv_move(-1)
def move_right(): _pv_move(1)
def move_left(): _pv_move(-1)
def jump(): _pv_move(1, True)

def collect_coin():
    position = _pv_state['position']
    if position in _pv_state['remaining']:
        _pv_state['remaining'].remove(position)
        _pv_state['coins'] += 1
    _pv_emit('collect')
def open_door():
    if _pv_state['coins'] >= 5:
        _pv_state['doorOpen'] = True
    _pv_emit('door')
def use_key():
    if _pv_state['key']:
        _pv_state['doorOpen'] = True
        _pv_state['key'] = False
    _pv_emit('key')
def attack():
    s = _pv_state
    if s['health'] > 0 and (s['enemyPosition'] is None or abs(s['position'] - s['enemyPosition']) <= 1):
        s['enemyHealth'] = max(0, s['enemyHealth'] - s['speed'] * 10)
        s['attacks'] += 1
    else:
        s['message'] = 'Move next to the enemy before attacking.'
    _pv_emit('attack')

def defend():
    _pv_state['defending'] = True
    _pv_emit('defend')
def wait(): _pv_emit('wait')
def get_health(): return _pv_state['health']
def get_coins(): return _pv_state['coins']
def set_speed(speed):
    if isinstance(speed, bool) or not isinstance(speed, (int, float)) or not _pv_math.isfinite(speed) or speed < 1 or speed > 10:
        raise ValueError('Speed must be a number from 1 to 10.')
    _pv_state['speed'] = speed
    _pv_emit('speed', speed)
def print(*args, **kwargs):
    _pv_builtins.print(*args, **kwargs)
    text = kwargs.get('sep', ' ').join(str(value) for value in args)
    if len(text) > 500: text = text[:500]
    _pv_state['message'] = text
    if _pv_state.get('magicMessage') and text == _pv_state['magicMessage']:
        _pv_state['doorOpen'] = True
    _pv_emit('message', text)
