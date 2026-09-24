import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOnboardingTour } from '../context/OnboardingTourContext';
import { NAV_ITEMS } from './navbar/navbarConstants';
import { useNavbarMemberState } from './navbar/useNavbarMemberState';
import NavbarAnnouncementBar from './navbar/NavbarAnnouncementBar';
import NavbarBrandLogo from './navbar/NavbarBrandLogo';
import NavbarDesktopNavLinks from './navbar/NavbarDesktopNavLinks';
import NavbarMemberCapsule from './navbar/NavbarMemberCapsule';
import NavbarActionGroup from './navbar/NavbarActionGroup';
import NavbarMobileDrawer from './navbar/NavbarMobileDrawer';
import NavbarMobileBottomNav from './navbar/NavbarMobileBottomNav';
import NavbarMobileMemberSheet from './navbar/NavbarMobileMemberSheet';
import NavbarMobileMoreSheet from './navbar/NavbarMobileMoreSheet';

function Navbar({
  cartCount,
  onOpenCart,
  onOpenOrder,
  onAddToCart,
  onOpenOrderHistory,
  onOpenGiftVault,
  isCartJiggling,
  onToast
}) {
  const [activeTab, setActiveTab] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMemberSheetOpen, setMobileMemberSheetOpen] = useState(false);
  const [mobileMoreSheetOpen, setMobileMoreSheetOpen] = useState(false);

  const { user, isAuthenticated, isInitialized, openAuthModal, logout } = useAuth();
  const { startTour } = useOnboardingTour();
  const navItems = NAV_ITEMS;

  const {
    tierInfo,
    totalPoints,
    availablePoints,
    pointsToNext,
    progressPercent,
    cardNumber,
    tasteSummary,
    favoriteDish,
    handleQuickReorder
  } = useNavbarMemberState({
    user,
    onAddToCart,
    onOpenCart,
    onToast,
    setMobileMenuOpen,
    setMobileMemberSheetOpen
  });

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const toggleMobileMoreSheet = useCallback(() => {
    setMobileMoreSheetOpen(prev => !prev);
  }, []);

  const closeMobileMoreSheet = useCallback(() => {
    setMobileMoreSheetOpen(false);
  }, []);

  const handleOpenLogin = useCallback(() => {
    if (openAuthModal) openAuthModal('login');
  }, [openAuthModal]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 font-sans shadow-md">
        {/* 1. Top vintage announcement bar */}
        <NavbarAnnouncementBar />

        {/* 2. Main Navigation Bar */}
        <div className="bg-[#f7f4ed]/95 backdrop-blur-md border-b border-stone-300/80 px-2.5 sm:px-4 xl:px-5 2xl:px-8 py-2 sm:py-3 w-full max-w-full">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4 w-full">
            
            {/* Logo Section */}
            <NavbarBrandLogo />

            {/* Navigation Links (Desktop) */}
            <NavbarDesktopNavLinks
              navItems={navItems}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />

            {/* Right Actions: Login/Member + Actions (Tour, Gift, Hotline, Cart, Mobile Triggers) */}
            <div className="flex items-center gap-1.5 sm:gap-2 2xl:gap-3 shrink-0">
              <NavbarMemberCapsule
                isAuthenticated={isAuthenticated}
                isInitialized={isInitialized}
                user={user}
                tierInfo={tierInfo}
                cardNumber={cardNumber}
                availablePoints={availablePoints}
                pointsToNext={pointsToNext}
                progressPercent={progressPercent}
                tasteSummary={tasteSummary}
                handleQuickReorder={handleQuickReorder}
                onOpenOrderHistory={onOpenOrderHistory}
                onOpenGiftVault={onOpenGiftVault}
                logout={logout}
                onToast={onToast}
                onOpenLogin={handleOpenLogin}
              />

              <NavbarActionGroup
                user={user}
                cartCount={cartCount}
                isCartJiggling={isCartJiggling}
                onOpenCart={onOpenCart}
                onOpenGiftVault={onOpenGiftVault}
                onStartTour={() => startTour(0)}
                mobileMoreSheetOpen={mobileMoreSheetOpen}
                toggleMobileMoreSheet={toggleMobileMoreSheet}
                mobileMenuOpen={mobileMenuOpen}
                toggleMobileMenu={toggleMobileMenu}
              />
            </div>

          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <NavbarMobileDrawer
            navItems={navItems}
            setActiveTab={setActiveTab}
            setMobileMenuOpen={setMobileMenuOpen}
            isAuthenticated={isAuthenticated}
            user={user}
            cardNumber={cardNumber}
            tierInfo={tierInfo}
            availablePoints={availablePoints}
            setMobileMemberSheetOpen={setMobileMemberSheetOpen}
            handleQuickReorder={handleQuickReorder}
            onOpenOrderHistory={onOpenOrderHistory}
            onOpenGiftVault={onOpenGiftVault}
            logout={logout}
            openAuthModal={openAuthModal}
            onToast={onToast}
          />
        )}
      </header>

      {/* 3. Mobile Bottom Navigation Bar */}
      <NavbarMobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        isCartJiggling={isCartJiggling}
        isInitialized={isInitialized}
        isAuthenticated={isAuthenticated}
        user={user}
        tierInfo={tierInfo}
        setMobileMemberSheetOpen={setMobileMemberSheetOpen}
        openAuthModal={openAuthModal}
        mobileMoreSheetOpen={mobileMoreSheetOpen}
        setMobileMoreSheetOpen={setMobileMoreSheetOpen}
      />

      {/* 4. Mobile Member Bottom Sheet */}
      <NavbarMobileMemberSheet
        mobileMemberSheetOpen={mobileMemberSheetOpen}
        setMobileMemberSheetOpen={setMobileMemberSheetOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        tierInfo={tierInfo}
        cardNumber={cardNumber}
        totalPoints={totalPoints}
        availablePoints={availablePoints}
        pointsToNext={pointsToNext}
        progressPercent={progressPercent}
        favoriteDish={favoriteDish}
        tasteSummary={tasteSummary}
        handleQuickReorder={handleQuickReorder}
        onOpenOrderHistory={onOpenOrderHistory}
        onOpenGiftVault={onOpenGiftVault}
        setActiveTab={setActiveTab}
        logout={logout}
        onToast={onToast}
      />

      {/* 5. Mobile More / Explore Bottom Sheet */}
      <NavbarMobileMoreSheet
        isOpen={mobileMoreSheetOpen}
        onClose={closeMobileMoreSheet}
        setActiveTab={setActiveTab}
        onOpenOrder={onOpenOrder}
        onOpenGiftVault={onOpenGiftVault}
        onOpenOrderHistory={onOpenOrderHistory}
        isAuthenticated={isAuthenticated}
        user={user}
        tierInfo={tierInfo}
        openAuthModal={openAuthModal}
        logout={logout}
        onToast={onToast}
        onStartTour={startTour}
      />
    </>
  );
}

export default React.memo(Navbar);
