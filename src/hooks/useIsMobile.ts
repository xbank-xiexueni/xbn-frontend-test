const useIsMobile = () => {
  const machineType =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )

  return machineType
}

export default useIsMobile
