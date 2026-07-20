import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchInboxCounts, markInboxRead } from '../features/inboxSlice';
import { getInboxCategoryForPath } from '../utils/inboxBadgeMap';

/**
 * Poll unread inbox counts and mark category read when user opens that section.
 */
export function useInboxBadges() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const counts = useSelector((state) => state.inbox.counts);

  useEffect(() => {
    if (!user) return undefined;

    dispatch(fetchInboxCounts());

    const intervalId = window.setInterval(() => {
      dispatch(fetchInboxCounts());
    }, 45000);

    const onFocus = () => dispatch(fetchInboxCounts());
    window.addEventListener('focus', onFocus);

    const onSwMessage = (event) => {
      if (event?.data?.type === 'INBOX_REFRESH') {
        dispatch(fetchInboxCounts());
      }
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;
    const category = getInboxCategoryForPath(location.pathname);
    if (category) {
      dispatch(markInboxRead(category));
    }
  }, [dispatch, user, location.pathname]);

  return counts || {};
}
