import { Arr } from '../../lib/utils/array';

describe('Array Helper', () => {
  beforeEach(async () => {});

  it('check key exists', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(Arr.exists(arr, 2)).toBeTruthy();
  });

  it('check key does not exist', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(Arr.exists(arr, 6)).toBeFalsy();
  });

  it('should return last element matching predicate', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(Arr.last(arr, x => x < 4)).toBe(3);
    expect(Arr.last(arr)).toBe(5);
  });

  it('should return the last object that matches the predicate', () => {
    const users = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 },
      { name: 'David', age: 30 },
    ];
    const lastUserUnder35 = Arr.last(users, user => user.age < 35);
    expect(lastUserUnder35).toEqual({ name: 'David', age: 30 });
  });

  it('should return undefined for empty array', () => {
    expect(Arr.last([])).toBeUndefined();
  });
});
